import { Nursery } from '~/server/models/Nursery'
import type { INursery } from '~/server/types/nursery'

export default defineEventHandler(async (event): Promise<INursery[]> => {
  const query = getQuery(event)
  const keyword = query.keyword
  const filter = keyword
    ? { $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { name_kana: { $regex: keyword, $options: 'i' } },
        { prefecture: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } },
        { address1: { $regex: keyword, $options: 'i' } },
        { address2: { $regex: keyword, $options: 'i' } },
        { address3: { $regex: keyword, $options: 'i' } },
        { childcare_age: { $regex: keyword, $options: 'i' } },
      ] }
    : {}

  await connectDB()

  const nurseries = await Nursery.find(filter).lean()

  return nurseries.map(nursery => ({
    ...nursery,
    _id: nursery._id.toString(),
  }))
})
