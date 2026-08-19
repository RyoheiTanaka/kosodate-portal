// 保育園データの取り込みスクリプト
//
//   node scripts/import-nurseries.mjs --dry-run
//   node scripts/import-nurseries.mjs
//   node scripts/import-nurseries.mjs --file=scripts/data/nurseries-2027.csv --source-date=2027-04-01
//
// - CSV の nursery_id（つくば市の園番号）をキーに upsert する
// - CSV に無い既存園は is_active: false にする（削除はしない。詳細ページのURLを残すため）
// - CSV に無い項目（設立年月日・団体名・利用可能曜日・備考・一時預かり）は既存値を保持する
import fs from 'node:fs'
import path from 'node:path'
import dns from 'node:dns'
import mongoose from 'mongoose'
import { assertWritable, resolveUri } from './lib/db.mjs'

// この開発環境では Atlas の SRV レコードがローカルDNSで解決できないため、明示的に指定する
dns.setServers(['8.8.8.8', '1.1.1.1'])

const ROOT = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const hasFlag = name => args.includes(`--${name}`)
const getOpt = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const DRY_RUN = hasFlag('dry-run')
const CSV_PATH = path.resolve(ROOT, getOpt('file', 'scripts/data/nurseries-2026.csv'))
const SOURCE_DATE = getOpt('source-date', '2026-04-01')

// Excel から書き出したCSVは先頭にBOMが付くため取り除く
const stripBom = text => (text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text)

const parseCsv = (text) => {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        cell += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (c !== '\r') {
      cell += c
    }
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  const header = rows.shift()
  return rows.filter(r => r.some(v => v !== '')).map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

// 住所から大字を切り出す。「茨城県つくば市島名2711番地1」→「島名」
// 地区マップ・エリアマップの両方で使うキー
const toOaza = s => String(s).replace(/^茨城県?/, '').replace(/^つくば市/, '')
  .replace(/[0-9０-９].*$/, '').replace(/(丁目|番地|字).*$/, '').trim()

const AREA_MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/data/oaza-area.json'), 'utf8'))

// エリアはCSVに列が無く、住所の大字から判定する（地区マップと同じ方式）。
// 地区がCSV由来なのに対しエリアは導出値なので、判定できない大字が出たら
// 取り込みを止める。空のまま入れるとその園がエリア絞り込みから消えるため (#86)。
const toArea = (address) => {
  const hit = AREA_MAP[toOaza(address)]
  return { area: hit?.name ?? '', area_alphabet: hit?.alphabet ?? '' }
}

const toDoc = row => ({
  nursery_id: Number(row.nursery_id),
  classification: row.classification,
  type: row.type,
  name: row.name,
  name_kana: row.name_kana,
  address: row.address,
  address_note: row.address_note,
  district: row.district,
  district_alphabet: row.district_alphabet,
  ...toArea(row.address),
  longitude: Number(row.longitude),
  latitude: Number(row.latitude),
  tel: row.tel,
  childcare_age: row.childcare_age,
  capacity: row.capacity ? Number(row.capacity) : null,
  open_weekday: row.open_weekday,
  close_weekday: row.close_weekday,
  open_saturday: row.open_saturday,
  close_saturday: row.close_saturday,
  standard_childcare_hour_11: row.h11,
  standard_childcare_hour_8: row.h8,
  // 空欄は「不明」。公立保育所は市が送迎バス情報を公開していないため断定しない
  shuttle_bus: row.shuttle_bus === '有' ? true : (row.shuttle_bus === '無' ? false : null),
  is_temporary_care: row.is_temporary_care === '有',
  available_day: row.available_day,
  is_active: true,
  source_date: SOURCE_DATE,
})

// つくば市が提供をやめ、他に出典も無いため廃止したフィールド。
// スキーマから消しても既存ドキュメントには残るため $unset で削除する。
// prefecture 以降は address / address_note に一本化して廃止した分割カラム (#84)。
// address が唯一の正で、これらはそこからの導出でしかなかった。
const REMOVED = [
  'access', 'approval_date', 'fax', 'corporate_number', 'url',
  'prefecture', 'city', 'address1', 'address2', 'address3',
]

// 取り込み対象外（既存値を保持する）フィールド
// establishment_date / corporate_name は公立園のみ、かつ過去の事実なので陳腐化しない。
// available_day_note / remark は現在の出典が無いが、内容が一般則のため保持する。
const PRESERVED = ['establishment_date', 'corporate_name', 'available_day_note', 'remark']

const validate = (rows) => {
  const errors = []
  const seen = new Set()
  for (const r of rows) {
    const id = Number(r.nursery_id)
    if (!Number.isInteger(id) || id <= 0) errors.push(`園番号が不正: "${r.nursery_id}" (${r.name})`)
    if (seen.has(id)) errors.push(`園番号が重複: ${id} (${r.name})`)
    seen.add(id)
    for (const f of ['classification', 'type', 'name', 'district', 'district_alphabet', 'address']) {
      if (!r[f]) errors.push(`${f} が空: ${id} ${r.name}`)
    }
    if (!Number.isFinite(Number(r.longitude)) || !Number.isFinite(Number(r.latitude))) {
      errors.push(`座標が不正: ${id} ${r.name}`)
    }
    if (!toArea(r.address).area_alphabet) {
      errors.push(`エリアを判定できない大字「${toOaza(r.address)}」: ${id} ${r.name}（${r.address}）`)
    }
  }
  return errors
}

const main = async () => {
  const { uri, dbName } = resolveUri()
  // dry-run は読むだけなので、本番を指していても止めない
  if (!DRY_RUN) assertWritable(dbName, args)
  if (!fs.existsSync(CSV_PATH)) throw new Error(`CSVが見つかりません: ${CSV_PATH}`)

  const rows = parseCsv(stripBom(fs.readFileSync(CSV_PATH, 'utf8')))
  console.log(`CSV: ${path.relative(ROOT, CSV_PATH)} (${rows.length}件) / 基準日: ${SOURCE_DATE}`)

  const errors = validate(rows)
  if (errors.length) {
    console.error(`\n入力エラー ${errors.length}件:`)
    errors.forEach(e => console.error('  -', e))
    console.error('\n新しい大字が出た場合は scripts/data/oaza-district.json と')
    console.error('scripts/data/oaza-area.json の両方に追記してください')
    process.exitCode = 1
    return
  }

  // 大字マップに無い住所を警告する（地区の判定漏れを検知するため）。
  // 地区はCSVの列から入るので、ここは突き合わせによる検知にとどめる。
  // エリアはこのマップからの導出値なので、判定できない場合は validate 側で止めている。
  const oaza = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/data/oaza-district.json'), 'utf8'))
  const unknown = [...new Set(rows.map(r => toOaza(r.address)).filter(o => !oaza[o]))]
  if (unknown.length) {
    console.warn(`\n⚠ 大字マップに無い住所: ${unknown.join(', ')}`)
    console.warn('  scripts/data/oaza-district.json への追記を検討してください')
  }

  // エリアごとの件数を出す。偏りの解消が目的の区分なので、
  // 取り込みのたびに分布が崩れていないか確認できるようにしている (#86)
  const areaCount = {}
  for (const r of rows) {
    const { area } = toArea(r.address)
    areaCount[area] = (areaCount[area] ?? 0) + 1
  }
  console.log('\n=== エリア別の件数 ===')
  for (const [area, n] of Object.entries(areaCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)} ${area}`)
  }

  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 20000 })
  // Nuxt のモデル定義は TypeScript のため、素の Node からはコレクションを直接操作する
  const col = mongoose.connection.db.collection('nurseries')

  const existing = await col.find({}).toArray()
  const byId = new Map(existing.map(d => [d.nursery_id, d]))

  const created = []
  const updated = []
  const unchanged = []

  for (const row of rows) {
    const doc = toDoc(row)
    const prev = byId.get(doc.nursery_id)
    if (!prev) {
      created.push(doc)
      continue
    }
    const diffs = Object.entries(doc).filter(([k, v]) => {
      const before = prev[k]
      if (typeof v === 'number' || typeof before === 'number') return Number(before ?? NaN) !== Number(v ?? NaN)
      return String(before ?? '') !== String(v ?? '')
    })
    if (diffs.length) {
      updated.push({ doc, prev, diffs })
    } else {
      unchanged.push(doc)
    }
  }

  const csvIds = new Set(rows.map(r => Number(r.nursery_id)))
  const closed = existing.filter(d => !csvIds.has(d.nursery_id) && d.is_active !== false)

  console.log(`\n新規 ${created.length} / 更新 ${updated.length} / 変更なし ${unchanged.length} / 閉園扱い ${closed.length}`)

  if (created.length) {
    console.log('\n=== 新規 ===')
    created.forEach(d => console.log(`  + ${d.nursery_id} ${d.name}（${d.district}）定員${d.capacity ?? '-'}`))
  }
  if (updated.length) {
    console.log('\n=== 更新 ===')
    for (const u of updated) {
      console.log(`  * ${u.doc.nursery_id} ${u.doc.name}`)
      u.diffs.forEach(([k, v]) => console.log(`      ${k}: ${JSON.stringify(u.prev[k] ?? null)} -> ${JSON.stringify(v)}`))
    }
  }
  if (closed.length) {
    console.log('\n=== 閉園扱い（is_active: false）===')
    closed.forEach(d => console.log(`  - ${d.nursery_id} ${d.name}`))
  }

  // 廃止フィールドは全ドキュメントから削除する。
  // スキーマから消しても既存ドキュメントには残るため、取り込みのたびに掃除する。
  // --dry-run でも件数を出す。フィールド廃止時はここが実質のマイグレーションになるため、
  // 流す前に対象件数を確認できないと困る。
  const hasRemoved = existing.filter(d => REMOVED.some(f => d[f] !== undefined))
  if (hasRemoved.length) {
    const fields = REMOVED.filter(f => existing.some(d => d[f] !== undefined))
    console.log(`\n=== 廃止フィールドの削除 ===`)
    console.log(`  対象 ${hasRemoved.length}件 / 実在するフィールド: ${fields.join(', ')}`)
  }

  if (DRY_RUN) {
    console.log('\n--dry-run のため書き込みは行いませんでした')
    await mongoose.disconnect()
    return
  }

  const unset = Object.fromEntries(REMOVED.map(f => [f, '']))
  const ops = []
  for (const d of [...created, ...updated.map(u => u.doc)]) {
    const prev = byId.get(d.nursery_id)
    const preserved = {}
    for (const f of PRESERVED) {
      if (prev && prev[f] !== undefined) preserved[f] = prev[f]
    }
    ops.push({
      updateOne: {
        filter: { nursery_id: d.nursery_id },
        update: {
          $set: { ...preserved, ...d, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
          $unset: unset,
        },
        upsert: true,
      },
    })
  }
  for (const d of closed) {
    ops.push({ updateOne: { filter: { nursery_id: d.nursery_id }, update: { $set: { is_active: false, updatedAt: new Date() } } } })
  }

  if (hasRemoved.length) {
    ops.push({ updateMany: { filter: {}, update: { $unset: unset } } })
  }

  // 閉園済み施設のフル住所を分割カラムから補完する処理はここにあったが、
  // 全件の address が埋まった時点で役目を終えたため削除した (#84)。
  // 補完元の分割カラム自体が上の $unset で消えるため、復活させることもできない。

  if (ops.length) {
    const res = await col.bulkWrite(ops)
    console.log(`\n書き込み完了: upserted=${res.upsertedCount} modified=${res.modifiedCount}`)
  } else {
    console.log('\n変更はありませんでした')
  }
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('ERROR:', e.message)
  process.exitCode = 1
})
