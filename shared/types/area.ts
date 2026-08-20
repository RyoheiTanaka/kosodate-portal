/**
 * エリア。一覧の主導線となる区分で、`runtimeConfig.public.globalAreas` の要素。
 * app / server 双方から参照する。
 *
 * 市の公式区分である地区（`District`）とは別軸。地区は6区分のまま維持し、
 * データ属性と既存URL（`/nurseries/[district]/[id]`）のために残している (#86)。
 * エリアの「桜」と地区の「桜地区」は範囲が異なるので、混同しないこと。
 */
export interface Area {
  name: string
  alphabet: string
  /** そのエリアに含まれる範囲の説明。フィルターや一覧の見出しで補足に使う */
  description: string
  /**
   * エリアを表すアイコン（`i-lucide-*`）。
   * 一覧が文字だけだと拾い読みしづらいので、エリアごとの目印として使う。
   * 装飾なので、これが無くても意味は通るようにしておくこと。
   */
  icon: string
  /**
   * カードの色味。`kosodate-pink` / `kosodate-yellow` のどちらを敷くか。
   * 隣り合うエリアが同じ色で続かないように配分している。
   */
  tone: 'pink' | 'yellow'
}
