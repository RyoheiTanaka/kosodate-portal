/**
 * 大字 → 代表点座標の対応表（app/data/oaza-latlng.json）を作る。
 *
 *   node scripts/build-oaza-latlng.mjs <位置参照情報(大字・町丁目レベル・茨城県)のCSV>
 *
 * 元データは国土交通省の位置参照情報ダウンロードサービスで配布されている
 * 「大字・町丁目レベル」の茨城県ファイル（08000-XX.X.zip を展開した 08000-XX.X.csv）。
 * Shift_JIS・1行目がヘッダーで、列は
 *   [0]都道府県コード [1]都道府県名 [2]市区町村コード [3]市区町村名
 *   [4]大字町丁目コード [5]大字町丁目名 [6]緯度 [7]経度
 *
 * 出力先が scripts/data ではなく app/data なのは、これだけは取り込み時ではなく
 * **アプリの実行時**に使うため（距離順ソートの基準点の選択肢, #139）。
 * 239件で 10KB 程度なので、そのままバンドルに載せている。
 *
 * ## なぜ座標のデータファイルを持つのか
 *
 * 以前は大字の代表点を「その大字にある保育所の重心」から計算していたため、
 * 保育所が1件も無い大字は選択肢に出せなかった（71件しか選べなかった）。
 * 自宅の大字が無い利用者は隣の大字を選ぶことになる。
 *
 * Geocoding API を使えば任意の住所を基準にできるが、課金の有効化とサーバー専用キーの
 * 管理が要り、入力された住所を外部へ送ることにもなる（#139 で不採用）。
 * 大字の代表点を静的に持てば、実行時の外部API呼び出しゼロで全大字を選べる。
 *
 * ## 丁目の扱い
 *
 * 位置参照情報は「二の宮一丁目」「二の宮二丁目」のように丁目ごとの行を持つが、
 * このサイトは大字までしか見ない（app/utils/geo.ts の toOaza と同じ粒度）。
 * 同じ大字に属する行の座標を平均して1点にまとめる。丁目の代表点はいずれも
 * その大字の中にあるので、平均も大字の中に収まる。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_PATH = path.join(ROOT, 'app/data/oaza-latlng.json')
const CITY = 'つくば市'

/**
 * 大字町丁目名を大字に丸める。
 *
 * app/utils/geo.ts の toOaza と同じ粒度にする。あちらは住所文字列から切り出すが、
 * こちらは既に大字町丁目名として分離されているので、丁目と字だけを落とす。
 */
const toOaza = name => String(name)
  // 「二の宮一丁目」→「二の宮」。丁目の番号ごと落とす。
  // 末尾の数字だけを別に落とすやり方はしない。「一」で終わる大字を削ってしまう
  .replace(/[0-9０-９一二三四五六七八九十]*丁目.*$/, '')
  .replace(/字.*$/, '')
  .trim()

const main = () => {
  const csvPath = process.argv[2]

  if (!csvPath) {
    console.error('使い方: node scripts/build-oaza-latlng.mjs <08000-XX.X.csv のパス>')
    console.error('  国土交通省 位置参照情報ダウンロードサービス（大字・町丁目レベル / 茨城県）')
    console.error('  https://nlftp.mlit.go.jp/isj/index.html')
    process.exit(1)
  }

  const text = new TextDecoder('shift_jis').decode(fs.readFileSync(csvPath))
  const lines = text.split('\n')

  // ヘッダー行を捨てる。列の並びが想定と違うファイルを黙って読まないよう、名前で確認する
  const header = (lines.shift() ?? '').replace(/"/g, '')
  if (!header.includes('大字町丁目名') || !header.includes('緯度') || !header.includes('経度')) {
    console.error('想定した列（大字町丁目名 / 緯度 / 経度）が見つかりません。')
    console.error(`  1行目: ${header.trim()}`)
    process.exit(1)
  }

  const groups = new Map()

  for (const line of lines) {
    if (!line.trim()) continue

    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())

    if (cols[3] !== CITY) continue

    const oaza = toOaza(cols[5])
    const latitude = Number(cols[6])
    const longitude = Number(cols[7])

    if (!oaza || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const current = groups.get(oaza) ?? { latitude: 0, longitude: 0, count: 0 }
    current.latitude += latitude
    current.longitude += longitude
    current.count += 1
    groups.set(oaza, current)
  }

  if (groups.size === 0) {
    console.error(`${CITY} の行が1件も見つかりませんでした。都道府県の指定を確認してください。`)
    process.exit(1)
  }

  // 座標は小数第6位（約10cm）まで。代表点にそれ以上の桁を持たせても意味が無い
  const round = n => Number(n.toFixed(6))

  const result = Object.fromEntries(
    [...groups.entries()]
      .map(([oaza, sum]) => [oaza, {
        latitude: round(sum.latitude / sum.count),
        longitude: round(sum.longitude / sum.count),
      }])
      .sort(([a], [b]) => a.localeCompare(b, 'ja')),
  )

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  console.log(`${OUT_PATH} を書き出しました`)
  console.log(`  大字: ${Object.keys(result).length} 件（元の行数: ${[...groups.values()].reduce((a, g) => a + g.count, 0)}）`)

  // 郵便番号の表（同じ大字の一覧）と突き合わせて、取りこぼしを見つける
  const postalPath = path.join(ROOT, 'scripts/data/oaza-postal.json')
  if (fs.existsSync(postalPath)) {
    const postal = JSON.parse(fs.readFileSync(postalPath, 'utf8'))
    const missing = Object.keys(postal).filter(o => !result[o])
    const extra = Object.keys(result).filter(o => !postal[o])

    console.log(`  郵便番号の表（${Object.keys(postal).length} 件）との差分:`)
    console.log(`    座標が無い大字: ${missing.length} 件${missing.length ? ` → ${missing.join('、')}` : ''}`)
    console.log(`    郵便番号の表に無い大字: ${extra.length} 件${extra.length ? ` → ${extra.join('、')}` : ''}`)
  }
}

main()
