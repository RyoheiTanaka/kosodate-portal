/**
 * データ基準日（`source_date`）の表示 (#111)。
 *
 * DB には市の配布データに合わせて `2026-04-01` の形で入っている。
 * 読み物の中にそのまま置くと ISO 形式が本文から浮くので、表示側で和文に直す。
 *
 * 解釈できない値はそのまま返す。将来データ側の表記が変わったときに
 * 空欄になるより、原文が出ているほうが気づける。
 */
export const formatSourceDate = (value: string | null | undefined): string => {
  if (!value) return ''

  const matched = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)

  if (!matched) return String(value)

  return `${Number(matched[1])}年${Number(matched[2])}月${Number(matched[3])}日`
}
