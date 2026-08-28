// xlsx から1シート目を読む。依存は足していない。
//
// つくば市のオープンデータは xlsx で出ているものが多い。xlsx は zip なので、
// node:zlib で展開して中の XML を読めば、パッケージを増やさずに取り込める。
// ここで扱うのは市の一覧ファイル（数十〜数百行、書式なし、1シート）だけなので、
// 汎用の xlsx パーサが要る場面には当たらない。
//
// 対応していないもの（市のファイルに出てこないため）:
// - 2枚目以降のシート、数式の計算結果以外、日付の表示形式、zip64
import fs from 'node:fs'
import zlib from 'node:zlib'

/** zip の中央ディレクトリを辿って1エントリだけ取り出す */
const readZipEntry = (buf, name) => {
  // End of Central Directory は可変長コメントの手前にあるので末尾から探す
  let eocd = buf.length - 22
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054B50) eocd--
  if (eocd < 0) throw new Error('zip として読めません（xlsx ではない可能性があります）')

  let offset = buf.readUInt32LE(eocd + 16)
  const count = buf.readUInt16LE(eocd + 10)
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(offset) !== 0x02014B50) throw new Error('zip の中央ディレクトリが壊れています')
    const nameLength = buf.readUInt16LE(offset + 28)
    const extraLength = buf.readUInt16LE(offset + 30)
    const commentLength = buf.readUInt16LE(offset + 32)
    const entryName = buf.toString('utf8', offset + 46, offset + 46 + nameLength)
    if (entryName === name) {
      const method = buf.readUInt16LE(offset + 10)
      const compressedSize = buf.readUInt32LE(offset + 20)
      const localOffset = buf.readUInt32LE(offset + 42)
      // ローカルヘッダの可変長部は中央ディレクトリの値と一致しないことがあるので読み直す
      const localNameLength = buf.readUInt16LE(localOffset + 26)
      const localExtraLength = buf.readUInt16LE(localOffset + 28)
      const start = localOffset + 30 + localNameLength + localExtraLength
      const body = buf.subarray(start, start + compressedSize)
      if (method === 0) return body
      if (method === 8) return zlib.inflateRawSync(body)
      throw new Error(`未対応の圧縮方式です: ${method}`)
    }
    offset += 46 + nameLength + extraLength + commentLength
  }
  throw new Error(`zip に ${name} がありません`)
}

const unescapeXml = s => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, '\'').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&amp;/g, '&')

/**
 * 共有文字列表。ルビ（<rPh>）を落としてから <t> を連結する。
 *
 * 市のファイルはセルにふりがなが埋まっていて、そのまま連結すると
 * 「横町127-４ヨコマチ」のように住所とふりがなが地続きになる。
 */
const readSharedStrings = (buf) => {
  let xml
  try {
    xml = readZipEntry(buf, 'xl/sharedStrings.xml').toString('utf8')
  } catch {
    return [] // 文字列がすべてインラインのファイルには共有文字列表が無い
  }
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => {
    const body = m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '')
    return unescapeXml([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join(''))
  })
}

/** セルの参照（A1, BC12）から0始まりの列番号を出す。空セルは省略されるため必要 */
const toColumnIndex = (ref) => {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? 'A'
  let n = 0
  for (const c of letters) n = n * 26 + (c.charCodeAt(0) - 64)
  return n - 1
}

/**
 * 1シート目を「行 × 列」の文字列の二次元配列で返す。
 * 空セルは '' で埋めるので、列の位置がずれない。
 */
export const readSheet = (source) => {
  const buf = Buffer.isBuffer(source) ? source : fs.readFileSync(source)
  const strings = readSharedStrings(buf)
  const xml = readZipEntry(buf, 'xl/worksheets/sheet1.xml').toString('utf8')

  const rows = []
  for (const row of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = []
    for (const cell of row[1].matchAll(/<c([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1] ?? ''
      const inner = cell[2] ?? ''
      const index = toColumnIndex(/r="([A-Z]+\d+)"/.exec(attrs)?.[1] ?? '')
      let value
      if (/t="s"/.test(attrs)) {
        value = strings[Number(/<v>([\s\S]*?)<\/v>/.exec(inner)?.[1])] ?? ''
      } else if (/t="inlineStr"/.test(attrs)) {
        const body = inner.replace(/<rPh[\s\S]*?<\/rPh>/g, '')
        value = unescapeXml([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join(''))
      } else {
        value = unescapeXml(/<v>([\s\S]*?)<\/v>/.exec(inner)?.[1] ?? '')
      }
      while (cells.length < index) cells.push('')
      cells[index] = value.trim()
    }
    rows.push(cells)
  }
  return rows
}

/**
 * 1行目をヘッダとして、行をオブジェクトの配列にする。
 * ヘッダ名は市のファイルの表記ゆれ（改行・空白）を吸収してから突き合わせる。
 */
export const readRecords = (source) => {
  const rows = readSheet(source)
  const header = (rows.shift() ?? []).map(h => h.replace(/\s+/g, ''))
  return rows
    .filter(r => r.some(v => v !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
}
