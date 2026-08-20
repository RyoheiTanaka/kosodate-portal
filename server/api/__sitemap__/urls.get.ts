import { Nursery } from '~~/server/models/Nursery'

/**
 * sitemap.xml のうち、動的ルートぶんのURLを列挙する (#151)。
 *
 * `@nuxtjs/sitemap` が自動で拾えるのは `app/pages/` にある静的なパスだけで、
 * 詳細（119件）・地区別・エリア別は `[district]` などの動的セグメントを含むため
 * 拾われない。ここで明示的に返す。
 *
 * 一覧の SSR HTML には詳細リンクが24件しか出ておらず（「もっと見る」以降は
 * クライアント描画）、全件辿れているのはエリア別ページの件数配分がたまたま
 * 上限を下回っているからにすぎない。この偶然への依存もこのエンドポイントで解消する。
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const globalDistricts = config.public.globalDistricts as Array<District>
  const globalAreas = config.public.globalAreas as Array<Area>

  await connectDB()

  // 閉園した施設は一覧に載らないので sitemap にも載せない（ページ自体はURL維持のため残る）
  const nurseries = await Nursery.find({ is_active: { $ne: false } })
    .select('nursery_id district_alphabet source_date updatedAt')
    .lean()

  return [
    ...globalDistricts.map(district => ({
      loc: `/nurseries/${district.alphabet}`,
      changefreq: 'monthly' as const,
      priority: 0.6,
    })),
    ...globalAreas.map(area => ({
      loc: `/nurseries/area/${area.alphabet}`,
      changefreq: 'monthly' as const,
      priority: 0.8,
    })),
    ...nurseries.map(nursery => ({
      loc: `/nurseries/${nursery.district_alphabet}/${nursery.nursery_id}`,
      // データはオープンデータの取り込み（月1）でしか変わらない。
      // updatedAt が無い古いドキュメントのために source_date を保険に置く。
      lastmod: nursery.updatedAt ?? nursery.source_date,
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),
  ]
})
