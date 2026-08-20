/**
 * JSON-LD を head に載せるためのヘルパー (#151)。
 *
 * nuxt-schema-org は使っていない。Nuxt 4.5 が積んでいる unhead v3 と噛み合わず、
 * `unhead/utils` の hasOwn が見つからずに開発サーバーごと落ちる（nuxt-schema-org 6.2.9 は
 * peer で ^3 を許容しているが、中身は v2 の API を呼んでいる）。
 *
 * 出したい型は ChildCare / BreadcrumbList / WebSite / Organization の4つだけで、
 * どれも素直な JSON なので自前で組む。何が出力されるかがコードから直接読めるという
 * 意味でも、実在しない情報を混ぜてはいけないこの用途には向いている。
 */
export const jsonLdScript = (data: Record<string, unknown>) => ({
  // as const が無いと type が string に広がり、unhead の script の型に入らない
  type: 'application/ld+json' as const,
  innerHTML: JSON.stringify({ '@context': 'https://schema.org', ...data }),
})

/**
 * ページ自体の構造化データ (#151)。
 *
 * 掲載データは月1回のオープンデータ取り込みでしか変わらない。`dateModified` を
 * 出しておくと、検索エンジンが再クロールの要否を判断しやすくなる。
 *
 * 値は施設の `updatedAt`（取り込み時に更新される）を使い、無い場合はデータ基準日
 * （`source_date`）に落とす。どちらも無ければ項目ごと出さない。推測の日付は入れない。
 */
export const buildWebPageSchema = (params: {
  url: string
  name: string
  siteUrl: string
  dateModified?: string
}): Record<string, unknown> => ({
  '@type': 'WebPage',
  '@id': `${params.url}#webpage`,
  'url': params.url,
  'name': params.name,
  'inLanguage': 'ja-JP',
  'isPartOf': { '@id': `${params.siteUrl}#website` },
  ...(params.dateModified ? { dateModified: params.dateModified } : {}),
})

/**
 * 施設の集まりから、いちばん新しい更新日時を ISO 8601 で返す。
 *
 * @returns 取り出せない場合は undefined
 */
export const latestDataUpdate = (
  nurseries: Array<{ updatedAt?: Date | string, source_date?: string }>,
): string | undefined => {
  const times = nurseries
    .map(nursery => nursery.updatedAt ?? nursery.source_date)
    .filter((value): value is Date | string => Boolean(value))
    .map(value => new Date(value).getTime())
    .filter(time => Number.isFinite(time))

  return times.length > 0 ? new Date(Math.max(...times)).toISOString() : undefined
}
