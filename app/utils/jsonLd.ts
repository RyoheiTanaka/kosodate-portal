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
