/**
 * 大字 → 郵便番号の対応表（scripts/data/oaza-postal.json）を作る。
 *
 *   node scripts/build-oaza-postal.mjs <日本郵便の郵便番号データ(茨城県)のCSV>
 *
 * 元データは日本郵便が配布している郵便番号データの都道府県別ファイル（08IBARAK）。
 * Shift_JIS・ヘッダー無しで、列は
 *   [0]全国地方公共団体コード [2]郵便番号 [7]市区町村 [8]町域
 *
 * 住所から郵便番号を「逆算」しない。推測した郵便番号は不正確な構造化データになり、
 * 検索エンジンに対して嘘をつくことになる。ここでやっているのは公式データの参照だけで、
 * 一意に決められない町域は表から外す（取り込み側で空のまま扱う）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_PATH = path.join(ROOT, 'scripts/data/oaza-postal.json')
const CITY = 'つくば市'

/*
 * 自動では決められず、人が確認して入れた分。
 *
 * - 要元中根: 郵便番号データにあるのは大字の「要」だけで、「元中根」は小字にあたる。
 *   ケアーズ保育園（つくば市要元中根178番地）の公式サイトの記載が 300-2622 で、
 *   大字「要」の番号と一致することを確認済み。
 * - 花畑: データが「花畑（１－７－１）」= 305-0805 と「花畑（その他）」= 300-3261 に
 *   分かれている。掲載中の2施設はいずれも 1-7-1 ではないため 300-3261。
 *   ケアーズ保育園花畑分園の公式サイトの記載とも一致する。
 *   **花畑1丁目7番1号の施設が将来出てきた場合は 305-0805 になるので、ここを見直すこと。**
 */
const MANUAL = {
  要元中根: '300-2622',
  花畑: '300-3261',
}

const main = () => {
  const csvPath = process.argv[2]

  if (!csvPath) {
    console.error('使い方: node scripts/build-oaza-postal.mjs <08IBARAK_1.CSV のパス>')
    process.exit(1)
  }

  const text = new TextDecoder('shift_jis').decode(fs.readFileSync(csvPath))

  const map = {}
  const skipped = []

  for (const line of text.split('\n')) {
    if (!line.trim()) continue

    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())

    if (cols[7] !== CITY) continue

    const town = cols[8]
    const code = cols[2]

    // 「以下に掲載がない場合」は市全体を指す番号で、大字とは対応しない
    if (town === '以下に掲載がない場合') continue

    // 「花畑（１－７－１）」のように番地で分かれるものは、大字だけでは決められない
    if (town.includes('（')) {
      skipped.push(`${town} → ${code}`)
      continue
    }

    map[town] = `${code.slice(0, 3)}-${code.slice(3)}`
  }

  const merged = Object.fromEntries(
    Object.entries({ ...map, ...MANUAL }).sort(([a], [b]) => a.localeCompare(b, 'ja')),
  )

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')

  console.log(`${OUT_PATH} を書き出しました`)
  console.log(`  自動: ${Object.keys(map).length} 件 / 手動: ${Object.keys(MANUAL).length} 件 / 合計: ${Object.keys(merged).length} 件`)

  if (skipped.length > 0) {
    console.log(`  番地で分かれるため除外した町域: ${skipped.length} 件`)
    for (const s of skipped) console.log(`    ${s}`)
  }
}

main()
