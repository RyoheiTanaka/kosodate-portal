import { Nursery } from '~/server/models/Nursery'
import type { INursery } from '~/server/types/nursery'

const escapeRegex = (text: string) => text.replace(/[\x00-\x1F\x7F]/g, '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export default defineEventHandler(async (event): Promise<INursery[]> => {
  const query = getQuery(event)
  let keyword = query.keyword ? String(query.keyword).trim() : ''

  if (keyword) {
    keyword = escapeRegex(keyword)
  }

  const filter = keyword
    ? { $or: ['name', 'name_kana', 'prefecture', 'city', 'address1', 'address2', 'address3', 'childcare_age']
        .map(field => ({ [field]: { $regex: escapeRegex(keyword), $options: 'i' } })) }
    : {}

  await connectDB()

  const nurseries = await Nursery.find(filter).lean()

  return nurseries.map(nursery => ({
    ...nursery,
    _id: nursery._id.toString(),
  }))
})
