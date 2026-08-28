// つくば市のオープンデータを、公開ページ経由で取得する。
//
// ファイルURLを決め打ちにしていない理由:
// ファイル名に日付が入るデータセットがあり（jidokan20260401.xlsx、
// 202608_mineijidouclubmap.xlsx など）、更新のたびにURLごと変わる。
// 決め打ちだと、更新された瞬間に 404 になるか、古いファイルを掴み続ける。
// 公開ページ側のURL（ページID）は変わらないので、そこからリンクを解決する。
//
// 調査の詳細は docs/opendata-survey.md。
import { readRecords } from './xlsx.mjs'

const ORIGIN = 'https://www.city.tsukuba.lg.jp'

const fetchOrThrow = async (url, init) => {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`取得に失敗しました (${res.status}): ${url}`)
  return res
}

/**
 * 公開ページのHTMLから、添付ファイルへのリンクを1つ解決する。
 * `pattern` に複数当たった場合は、どれを使うか決められないのでエラーにする。
 */
export const resolveFileUrl = async (pageUrl, pattern) => {
  const html = await (await fetchOrThrow(pageUrl)).text()
  const hits = [...html.matchAll(/href="([^"]*\/material\/files\/[^"]+)"/g)]
    .map(m => (m[1].startsWith('//') ? `https:${m[1]}` : new URL(m[1], ORIGIN).href))
    .filter(url => pattern.test(url))
  const unique = [...new Set(hits)]

  if (unique.length === 0) {
    throw new Error(
      `${pageUrl} に ${pattern} に合うファイルがありません。`
      + 'ページの構成かファイル名が変わった可能性があります',
    )
  }
  if (unique.length > 1) {
    throw new Error(`${pattern} に複数当たりました:\n  ${unique.join('\n  ')}`)
  }
  return unique[0]
}

/** ファイルの中身と Last-Modified を取る。鮮度の判定に Last-Modified を使う */
export const fetchFile = async (url) => {
  const res = await fetchOrThrow(url)
  const lastModified = res.headers.get('last-modified')
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    lastModified: lastModified ? new Date(lastModified) : null,
  }
}

/**
 * 公開ページからファイルを解決して取得し、xlsx をレコードの配列にして返す。
 * ローカルのファイルを渡した場合はネットワークに出ない（差分の確認用）。
 */
export const fetchRecords = async ({ pageUrl, pattern, localPath }) => {
  if (localPath) {
    return { records: readRecords(localPath), url: localPath, lastModified: null }
  }
  const url = await resolveFileUrl(pageUrl, pattern)
  const { buffer, lastModified } = await fetchFile(url)
  return { records: readRecords(buffer), url, lastModified }
}
