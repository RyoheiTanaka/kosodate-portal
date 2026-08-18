import { Nursery } from '~~/server/models/Nursery'
import type { INursery } from '~~/server/types/nursery'

// 制御文字の除去が目的なので no-control-regex は意図的に無効化する
// eslint-disable-next-line no-control-regex
const escapeRegex = (text: string) => text.replace(/[\x00-\x1F\x7F]/g, '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export default defineEventHandler(async (event): Promise<INursery[]> => {
  const query = getQuery(event)
  let keyword = query.keyword ? String(query.keyword).trim() : ''

  // エスケープはここで1回だけ行う。$or の組み立て時に再度かけると
  // バックスラッシュが二重になり、記号を含むキーワードがヒットしなくなる
  if (keyword) {
    keyword = escapeRegex(keyword)
  }

  // 閉園した施設は一覧に含めない（詳細ページはURL維持のため残す）
  const filter: Record<string, unknown> = { is_active: { $ne: false } }

  if (keyword) {
    filter.$or = ['name', 'name_kana', 'address', 'childcare_age']
      .map(field => ({ [field]: { $regex: keyword, $options: 'i' } }))
  }

  await connectDB()

  const nurseries = await Nursery.find(filter).lean()

  return nurseries.map(serializeNursery)
})
