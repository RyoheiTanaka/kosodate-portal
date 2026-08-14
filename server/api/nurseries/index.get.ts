import { Nursery } from '~~/server/models/Nursery'

// 制御文字の除去が目的なので no-control-regex は意図的に無効化する
// eslint-disable-next-line no-control-regex
const escapeRegex = (text: string) => text.replace(/[\x00-\x1F\x7F]/g, '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export default defineEventHandler(async (event): Promise<INursery[]> => {
  const query = getQuery(event)
  let keyword = query.keyword ? String(query.keyword).trim() : ''

  if (keyword) {
    keyword = escapeRegex(keyword)
  }

  // 閉園した施設は一覧に含めない（詳細ページはURL維持のため残す）
  const filter: Record<string, unknown> = { is_active: { $ne: false } }

  if (keyword) {
    filter.$or = ['name', 'name_kana', 'prefecture', 'city', 'address1', 'address2', 'address3', 'childcare_age']
      .map(field => ({ [field]: { $regex: escapeRegex(keyword), $options: 'i' } }))
  }

  await connectDB()

  const nurseries = await Nursery.find(filter).lean()

  return nurseries.map(nursery => ({
    ...nursery,
    _id: nursery._id.toString(),
  }))
})
