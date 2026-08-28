// 認可保育所以外の子育て施設の取り込みスクリプト (#122)
//
//   node scripts/import-facilities.mjs --dry-run
//   node scripts/import-facilities.mjs --type=jidokan
//   node scripts/import-facilities.mjs --file=path/to.xlsx --source-date=2026-04-01
//
// - つくば市の公開ページから xlsx を解決して取得する。ファイルURLは決め打ちにしない
//   （ファイル名に日付が入り、更新のたびに変わるデータセットがあるため）
// - type + name をキーに upsert する
// - 一覧から消えた施設は is_active: false にする（削除はしない。URLを残すため）
//
// 対象データセットの選定理由は docs/opendata-survey.md、運用は
// docs/facility-data-update.md にある。
import dns from 'node:dns'
import mongoose from 'mongoose'
import { assertWritable, resolveUri } from './lib/db.mjs'
import { fetchRecords } from './lib/opendata.mjs'
import { toArea, toDistrict, toOaza, toPostalCode } from './lib/oaza.mjs'

// この開発機では Node 内蔵の DNS クライアント（c-ares）がアダプタの設定を読めず
// 127.0.0.1 を掴むため、mongodb+srv:// の SRV 解決が ECONNREFUSED で落ちる。
// 明示的に公開DNSを指定して回避する。詳細は server/utils/mongo.ts のコメント。
dns.setServers(['8.8.8.8', '1.1.1.1'])

const args = process.argv.slice(2)
const hasFlag = name => args.includes(`--${name}`)
const getOpt = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const DRY_RUN = hasFlag('dry-run')
const LOCAL_FILE = getOpt('file', '')

/**
 * 取り込む施設種別の定義。
 *
 * 1種別ずつ足していく。座標が無い・ファイルが古い・PDFしか無いデータセットは
 * ここに入れない（判断の根拠は docs/opendata-survey.md）。
 */
const DATASETS = {
  jidokan: {
    label: '児童館',
    sourceName: '児童館一覧',
    sourceUrl: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/jidoukan/1001127.html',
    // jidokan20260401.xlsx のように年月が付く。年度が変わるとURLごと変わる
    pattern: /\/jidokan[0-9]*\.xlsx$/i,
    sourceDate: '2026-04-01',
    toRow: r => ({
      name: r['児童館名'],
      address: r['住所'],
      tel: r['電話番号'],
      url: r['ホームページ'],
      longitude: r['経度（世界測地系）'],
      latitude: r['緯度（世界測地系）'],
      attributes: {},
    }),
  },
}

const TYPE = getOpt('type', 'jidokan')
const DATASET = DATASETS[TYPE]
if (!DATASET) {
  console.error(`未対応の施設種別です: ${TYPE}（対応: ${Object.keys(DATASETS).join(', ')}）`)
  process.exit(1)
}

const SOURCE_DATE = getOpt('source-date', DATASET.sourceDate)

/**
 * 住所を保育所データと同じ表記に揃える。
 *
 * 市のファイルは種別ごとに表記が違う（児童館は市名なしの「横町127-４」、
 * 支援拠点は全角の「つくば市流星台６１－１」）。既存の保育所は
 * 「つくば市大曽根3410番地」なので、市名を補って数字を半角にする。
 * 大字より後ろの表記（番地／ハイフン）は市のデータのままにしておく。
 */
const normalizeAddress = (raw) => {
  const body = String(raw).trim()
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[－―ー−]/g, '-')
    .replace(/\s+/g, '')
  return body.startsWith('つくば市') ? body : `つくば市${body}`
}

const toDoc = (row) => {
  const address = normalizeAddress(row.address)
  return {
    type: TYPE,
    name: String(row.name).trim(),
    address,
    address_note: String(row.address_note ?? '').trim(),
    postal_code: toPostalCode(address),
    ...toArea(address),
    longitude: Number(row.longitude),
    latitude: Number(row.latitude),
    tel: String(row.tel ?? '').trim(),
    url: String(row.url ?? '').trim(),
    attributes: row.attributes ?? {},
    source_name: DATASET.sourceName,
    source_url: DATASET.sourceUrl,
    source_date: SOURCE_DATE,
    is_active: true,
  }
}

const validate = (docs) => {
  const errors = []
  const seen = new Set()
  for (const d of docs) {
    if (!d.name) errors.push(`名称が空: ${JSON.stringify(d.address)}`)
    if (seen.has(d.name)) errors.push(`名称が重複: ${d.name}（type + name をキーにしているため取り込めません）`)
    seen.add(d.name)
    if (!d.address) errors.push(`住所が空: ${d.name}`)
    if (!Number.isFinite(d.longitude) || !Number.isFinite(d.latitude)) {
      errors.push(`座標が不正: ${d.name}`)
    }
    // エリアは住所からの導出値。判定できないまま入れるとエリア絞り込みから消えるので止める (#86)
    if (!d.area_alphabet) {
      errors.push(`エリアを判定できない大字「${toOaza(d.address)}」: ${d.name}（${d.address}）`)
    }
  }
  return errors
}

const main = async () => {
  const { uri, dbName } = resolveUri()
  // dry-run は読むだけなので、本番を指していても止めない
  if (!DRY_RUN) assertWritable(dbName, args)

  const { records, url, lastModified } = await fetchRecords({
    pageUrl: DATASET.sourceUrl,
    pattern: DATASET.pattern,
    localPath: LOCAL_FILE,
  })

  console.log(`種別: ${TYPE}（${DATASET.label}） / 基準日: ${SOURCE_DATE}`)
  console.log(`ソース: ${url}`)
  if (lastModified) {
    const days = Math.floor((Date.now() - lastModified.getTime()) / 86400000)
    console.log(`ファイル更新日: ${lastModified.toISOString().slice(0, 10)}（${days}日前）`)
    // 市の「随時更新」は実態と合わないことがある。古いまま取り込むと誤情報を載せるので警告する
    if (days > 730) console.warn('⚠ 2年以上更新されていません。市のページと突き合わせてから取り込んでください')
  }
  console.log(`${records.length}件`)

  const docs = records.map(r => toDoc(DATASET.toRow(r)))

  const errors = validate(docs)
  if (errors.length) {
    console.error(`\n入力エラー ${errors.length}件:`)
    errors.forEach(e => console.error('  -', e))
    console.error('\n新しい大字が出た場合は scripts/data/oaza-area.json と')
    console.error('scripts/data/oaza-district.json の両方に追記してください')
    process.exitCode = 1
    return
  }

  // 地区マップの取りこぼしを検知する。地区は施設のドキュメントには持たせないが、
  // 大字マップは保育所と共用しているので、片方だけ育つのを防ぐ
  const noDistrict = [...new Set(docs.filter(d => !toDistrict(d.address).district).map(d => toOaza(d.address)))]
  if (noDistrict.length) {
    console.warn(`\n⚠ 地区マップに無い大字: ${noDistrict.join(', ')}`)
    console.warn('  scripts/data/oaza-district.json への追記を検討してください')
  }

  const noPostal = [...new Set(docs.filter(d => !d.postal_code).map(d => toOaza(d.address)))]
  if (noPostal.length) {
    console.warn(`\n⚠ 郵便番号を引けなかった大字: ${noPostal.join(', ')}`)
    console.warn('  番地で郵便番号が分かれる大字であれば scripts/build-oaza-postal.mjs の MANUAL に追記してください')
  }

  const areaCount = {}
  for (const d of docs) areaCount[d.area] = (areaCount[d.area] ?? 0) + 1
  console.log('\n=== エリア別の件数 ===')
  for (const [area, n] of Object.entries(areaCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)} ${area}`)
  }

  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 20000 })
  // Nuxt のモデル定義は TypeScript のため、素の Node からはコレクションを直接操作する
  const col = mongoose.connection.db.collection('facilities')

  // アプリ側はまだ Facility モデルを使っていないので、mongoose によるインデックス作成が
  // 走らない。upsert のキーの一意性はここで担保しておく（作成済みなら何も起きない）。
  if (!DRY_RUN) {
    await col.createIndex({ type: 1, name: 1 }, { unique: true })
    await col.createIndex({ area_alphabet: 1 })
    await col.createIndex({ is_active: 1 })
  }

  const existing = await col.find({ type: TYPE }).toArray()
  const byName = new Map(existing.map(d => [d.name, d]))

  const created = []
  const updated = []
  const unchanged = []

  for (const doc of docs) {
    const prev = byName.get(doc.name)
    if (!prev) {
      created.push(doc)
      continue
    }
    const diffs = Object.entries(doc).filter(([k, v]) => {
      const before = prev[k]
      if (typeof v === 'number' || typeof before === 'number') return Number(before ?? NaN) !== Number(v ?? NaN)
      if (v && typeof v === 'object') return JSON.stringify(before ?? {}) !== JSON.stringify(v)
      return String(before ?? '') !== String(v ?? '')
    })
    if (diffs.length) updated.push({ doc, prev, diffs })
    else unchanged.push(doc)
  }

  const names = new Set(docs.map(d => d.name))
  const gone = existing.filter(d => !names.has(d.name) && d.is_active !== false)

  console.log(`\n新規 ${created.length} / 更新 ${updated.length} / 変更なし ${unchanged.length} / 一覧から消えた ${gone.length}`)

  if (created.length) {
    console.log('\n=== 新規 ===')
    created.forEach(d => console.log(`  + ${d.name}（${d.area}）${d.address}`))
  }
  if (updated.length) {
    console.log('\n=== 更新 ===')
    for (const u of updated) {
      console.log(`  * ${u.doc.name}`)
      u.diffs.forEach(([k, v]) => console.log(`      ${k}: ${JSON.stringify(u.prev[k] ?? null)} -> ${JSON.stringify(v)}`))
    }
  }
  if (gone.length) {
    console.log('\n=== 一覧から消えた（is_active: false）===')
    // 施設名の変更でもここに出る。閉館と区別が付かないので、出たら市のページを確認する
    gone.forEach(d => console.log(`  - ${d.name}`))
  }

  if (DRY_RUN) {
    console.log('\n--dry-run のため書き込みは行いませんでした')
    await mongoose.disconnect()
    return
  }

  const ops = []
  for (const d of [...created, ...updated.map(u => u.doc)]) {
    ops.push({
      updateOne: {
        filter: { type: d.type, name: d.name },
        update: { $set: { ...d, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        upsert: true,
      },
    })
  }
  for (const d of gone) {
    ops.push({
      updateOne: {
        filter: { type: TYPE, name: d.name },
        update: { $set: { is_active: false, updatedAt: new Date() } },
      },
    })
  }

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
