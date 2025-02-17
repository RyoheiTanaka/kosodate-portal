import { Nursery } from '~/server/models/Nursery'
import type { INursery } from '~/server/types/nursery'

export default defineEventHandler(async (): Promise<INursery[]> => {
  await connectDB()
  const nurseries = await Nursery.find().lean()
  return nurseries.map(nursery => ({
    ...nursery,
    _id: nursery._id.toString(),
  }))
})
