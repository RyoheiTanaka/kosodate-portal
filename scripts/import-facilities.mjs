// 認可保育所以外の子育て施設の取り込みスクリプト (#122)
//
//   node scripts/import-facilities.mjs --dry-run
//   node scripts/import-facilities.mjs --type=jidou-club
//   node scripts/import-facilities.mjs --type=all
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
const SOURCE_DATE_OVERRIDE = getOpt('source-date', '')

const JIDOUKAN_PAGE = 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/jidoukan/1001127.html'

/**
 * 取り込む施設種別の定義。
 *
 * 1種別ずつ足していく。座標が無い・ファイルが古い・PDFしか無いデータセットは
 * ここに入れない（判断の根拠は docs/opendata-survey.md）。
 *
 * `date` はデータの基準日。市のページに書かれている時点（「令和8年6月1日時点」など）で、
 * ファイルの更新日とは別物。出典表記に出すのはこちら (#111)。
 */
const DATASETS = {
  'jidokan': {
    label: '児童館',
    sources: [{
      name: '児童館一覧',
      pageUrl: JIDOUKAN_PAGE,
      // jidokan20260401.xlsx のように年月が付く。年度が変わるとURLごと変わる
      pattern: /\/jidokan[0-9]*\.xlsx$/i,
      date: '2026-04-01',
      toRow: r => ({
        name: r['児童館名'],
        address: r['住所'],
        tel: r['電話番号'],
        url: r['ホームページ'],
        longitude: r['経度（世界測地系）'],
        latitude: r['緯度（世界測地系）'],
      }),
    }],
  },

  'jidou-club': {
    label: '児童クラブ',
    // 公設公営31件のうち17件は児童館そのもの（名称・住所・電話・座標が一致）。
    // 別ドキュメントにすると同じ建物が2件になり、「周辺の施設が何件」を数えたときに
    // 二重に数えてしまう。名称が一致する児童館があれば、そちらへ併設情報として書く。
    mergeInto: 'jidokan',
    sources: [
      {
        name: '公設公営児童クラブ一覧',
        pageUrl: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/jidoukan/1001128.html',
        pattern: /kousetsukouei[a-z0-9]*\.xlsx$/i,
        date: '2026-04-01',
        toRow: r => toClubRow(r),
      },
      {
        name: '公設民営児童クラブ一覧',
        pageUrl: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/jidoukan/1003621.html',
        pattern: /kousetsuminei[a-z0-9]*\.xlsx$/i,
        date: '2024-04-01',
        toRow: r => toClubRow(r),
      },
      {
        name: '民設民営児童クラブ一覧',
        pageUrl: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/jidoukan/1003622.html',
        // 202608_mineijidouclubmap.xlsx。同名の PDF もあるので拡張子で絞る
        pattern: /mineijidouclubmap\.xlsx$/i,
        date: '2026-08-01',
        toRow: r => toClubRow(r),
      },
    ],
  },

  'kosodate-shien': {
    label: '地域子育て支援拠点',
    sources: [{
      name: '地域子育て支援拠点一覧（出張子育て広場含む）',
      pageUrl: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/shien/1001133.html',
      pattern: /chiikikosodateshiennkyotenn[a-z0-9]*\.xlsx$/i,
      date: '2026-06-01',
      toRow: r => ({
        name: r['名称'],
        address: r['住所'],
        address_note: r['方書'],
        tel: r['電話'],
        longitude: r['経度'],
        latitude: r['緯度'],
        attributes: {
          種別: r['種別'],
          実施日: r['実施日'],
          実施時間: r['実施時間'],
        },
      }),
    }],
  },
}

// 児童クラブ3ファイルは列が同じなので、行の読み方を共通にしている
function toClubRow(r) {
  return {
    name: r['児童クラブ名'],
    address: r['住所'],
    tel: r['電話番号'],
    longitude: r['経度（世界測地系）'],
    latitude: r['緯度（世界測地系）'],
    attributes: {
      区分: r['区分'],
      受入対象小学校: r['受入対象小学校'],
    },
  }
}

const TYPE = getOpt('type', 'jidokan')
const TYPES = TYPE === 'all' ? Object.keys(DATASETS) : [TYPE]
for (const t of TYPES) {
  if (!DATASETS[t]) {
    console.error(`未対応の施設種別です: ${t}（対応: ${Object.keys(DATASETS).join(', ')}, all）`)
    process.exit(1)
  }
}
if (LOCAL_FILE && (TYPES.length > 1 || DATASETS[TYPES[0]].sources.length > 1)) {
  console.error('--file は単一ファイルの種別にしか使えません（--type で1つに絞ってください）')
  process.exit(1)
}

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

/** 空の属性は入れない。列はあるが中身が無い行があるため */
const cleanAttributes = (attributes = {}) => Object.fromEntries(
  Object.entries(attributes).map(([k, v]) => [k, String(v ?? '').trim()]).filter(([, v]) => v !== ''),
)

const toDoc = (row, source, type) => {
  const address = normalizeAddress(row.address)
  return {
    type,
    name: String(row.name ?? '').trim(),
    address,
    address_note: String(row.address_note ?? '').trim(),
    postal_code: toPostalCode(address),
    ...toArea(address),
    longitude: Number(row.longitude),
    latitude: Number(row.latitude),
    tel: String(row.tel ?? '').trim(),
    url: String(row.url ?? '').trim(),
    attributes: cleanAttributes(row.attributes),
    source_name: source.name,
    source_url: source.pageUrl,
    source_date: SOURCE_DATE_OVERRIDE || source.date,
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

/** 2点間の直線距離（km）。同じ建物かどうかの確認にしか使わないので簡易式で足りる */
const distanceKm = (a, b) => Math.hypot((a.longitude - b.longitude) * 91, (a.latitude - b.latitude) * 111)

/** attributes をドット記法に開く。オブジェクトごと $set すると他ソースが足したキーを消すため */
const toAttributeSet = attributes => Object.fromEntries(
  Object.entries(attributes).map(([k, v]) => [`attributes.${k}`, v]),
)

const isSame = (before, after) => {
  if (typeof after === 'number' || typeof before === 'number') return Number(before ?? NaN) === Number(after ?? NaN)
  return String(before ?? '') === String(after ?? '')
}

/**
 * 属性は「このソースが持つキー」だけを見る。
 * 書き込みもドット記法でキー単位に行うので、比較もそれに合わせないと、
 * 他のソースが足したキーのぶんだけ毎回「更新あり」になってしまう。
 */
const hasAttributeChange = (before = {}, after = {}) =>
  Object.entries(after).some(([k, v]) => !isSame(before[k], v))

const collect = async (dataset) => {
  const docs = []
  for (const source of dataset.sources) {
    const { records, url, lastModified } = await fetchRecords({
      pageUrl: source.pageUrl,
      pattern: source.pattern,
      localPath: LOCAL_FILE,
    })
    let age = ''
    if (lastModified) {
      const days = Math.floor((Date.now() - lastModified.getTime()) / 86400000)
      age = ` / 更新 ${lastModified.toISOString().slice(0, 10)}（${days}日前）`
      // 市の「更新周期: 随時」は実態と合わないことがある。
      // 古いまま取り込むと誤情報を載せるので、気づけるようにしておく
      if (days > 730) age += ' ⚠2年以上更新なし'
    }
    console.log(`  ${source.name}: ${records.length}件${age}`)
    console.log(`    ${url}`)
    for (const r of records) docs.push(toDoc(source.toRow(r), source, dataset.type))
  }
  return docs
}

const importType = async (col, type) => {
  const dataset = { ...DATASETS[type], type }
  console.log(`\n=== ${type}（${dataset.label}）===`)

  const docs = await collect(dataset)

  const errors = validate(docs)
  if (errors.length) {
    console.error(`\n入力エラー ${errors.length}件:`)
    errors.forEach(e => console.error('  -', e))
    console.error('\n新しい大字が出た場合は scripts/data/oaza-area.json と')
    console.error('scripts/data/oaza-district.json の両方に追記してください')
    return false
  }

  // 地区マップの取りこぼしを検知する。地区は施設のドキュメントには持たせないが、
  // 大字マップは保育所と共用しているので、片方だけ育つのを防ぐ
  const noDistrict = [...new Set(docs.filter(d => !toDistrict(d.address).district).map(d => toOaza(d.address)))]
  if (noDistrict.length) {
    console.warn(`⚠ 地区マップに無い大字: ${noDistrict.join(', ')}`)
  }
  const noPostal = [...new Set(docs.filter(d => !d.postal_code).map(d => toOaza(d.address)))]
  if (noPostal.length) {
    console.warn(`⚠ 郵便番号を引けなかった大字: ${noPostal.join(', ')}`)
  }

  // 併設先（児童館）に寄せる行を分ける
  const merges = []
  const own = []
  if (dataset.mergeInto) {
    const parents = new Map(
      (await col.find({ type: dataset.mergeInto }).toArray()).map(d => [d.name, d]),
    )
    if (parents.size === 0) {
      console.error(`先に --type=${dataset.mergeInto} を取り込んでください（併設先が1件もありません）`)
      return false
    }
    for (const d of docs) {
      const parent = parents.get(d.name)
      // 名前が一致しても場所が離れていれば別施設。同名の別物を潰さないよう独立させる
      if (parent && distanceKm(parent, d) < 0.1) merges.push({ doc: d, parent })
      else if (parent) {
        console.warn(`⚠ 同名だが場所が離れています（別施設として登録します）: ${d.name}`)
        own.push(d)
      } else own.push(d)
    }
  } else {
    own.push(...docs)
  }

  const existing = await col.find({ type }).toArray()
  const byName = new Map(existing.map(d => [d.name, d]))

  const created = []
  const updated = []
  const unchanged = []
  for (const doc of own) {
    const prev = byName.get(doc.name)
    if (!prev) {
      created.push(doc)
      continue
    }
    const diffs = Object.entries(doc).filter(([k, v]) => (k === 'attributes'
      ? hasAttributeChange(prev.attributes, v)
      : !isSame(prev[k], v)))
    if (diffs.length) updated.push({ doc, prev, diffs })
    else unchanged.push(doc)
  }

  const names = new Set(own.map(d => d.name))
  const gone = existing.filter(d => !names.has(d.name) && d.is_active !== false)

  // 併設ぶんは属性の差分だけを見る
  const mergedNew = merges.filter(m => hasAttributeChange(m.parent.attributes, m.doc.attributes))

  console.log(`\n新規 ${created.length} / 更新 ${updated.length} / 変更なし ${unchanged.length} / 一覧から消えた ${gone.length}`)
  if (merges.length) {
    console.log(`${dataset.mergeInto} に併設として統合 ${merges.length}（うち属性の変更 ${mergedNew.length}）`)
  }

  if (created.length) {
    console.log('\n--- 新規')
    created.forEach(d => console.log(`  + ${d.name}（${d.area}）${d.address}`))
  }
  if (updated.length) {
    console.log('\n--- 更新')
    for (const u of updated) {
      console.log(`  * ${u.doc.name}`)
      u.diffs.forEach(([k, v]) => console.log(`      ${k}: ${JSON.stringify(u.prev[k] ?? null)} -> ${JSON.stringify(v)}`))
    }
  }
  if (mergedNew.length) {
    console.log(`\n--- 併設として統合（${dataset.mergeInto} に属性を追加）`)
    mergedNew.forEach(m => console.log(`  ~ ${m.doc.name}: ${JSON.stringify(m.doc.attributes)}`))
  }
  if (gone.length) {
    console.log('\n--- 一覧から消えた（is_active: false）')
    // 施設名の変更でもここに出る。閉館と区別が付かないので、出たら市のページを確認する
    gone.forEach(d => console.log(`  - ${d.name}`))
  }

  if (DRY_RUN) return true

  const ops = []
  for (const d of [...created, ...updated.map(u => u.doc)]) {
    // attributes はドット記法で入れる。ソースをまたいで足したキーを消さないため
    const { attributes, ...rest } = d
    ops.push({
      updateOne: {
        filter: { type: d.type, name: d.name },
        update: {
          $set: { ...rest, ...toAttributeSet(attributes), updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    })
  }
  for (const m of mergedNew) {
    ops.push({
      updateOne: {
        filter: { type: dataset.mergeInto, name: m.doc.name },
        update: { $set: { ...toAttributeSet(m.doc.attributes), updatedAt: new Date() } },
      },
    })
  }
  for (const d of gone) {
    ops.push({
      updateOne: {
        filter: { type, name: d.name },
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
  return true
}

const main = async () => {
  const { uri, dbName } = resolveUri()
  // dry-run は読むだけなので、本番を指していても止めない
  if (!DRY_RUN) assertWritable(dbName, args)

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

  // 併設の判定に児童館のドキュメントが要るので、定義順（児童館が先）に流す
  for (const type of TYPES) {
    const ok = await importType(col, type)
    if (!ok) {
      process.exitCode = 1
      break
    }
  }

  if (DRY_RUN) console.log('\n--dry-run のため書き込みは行いませんでした')
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('ERROR:', e.message)
  process.exitCode = 1
})
