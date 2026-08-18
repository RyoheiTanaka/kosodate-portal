import { Nursery } from '~~/server/models/Nursery'
import type { INursery } from '~~/server/types/nursery'

export default defineEventHandler(async (event): Promise<INursery> => {
  // nursery_id は数値カラム。文字列のまま渡すと Mongoose のキャストが投げて 500 になる
  const nurseryId = Number(event.context.params?.id)

  if (!Number.isInteger(nurseryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID', message: 'IDが不正です' })
  }

  await connectDB()

  const nursery = await Nursery.findOne({ nursery_id: nurseryId }).lean()

  if (!nursery) {
    throw createError({ statusCode: 404, statusMessage: 'Nursery not found', message: '施設が見つかりません' })
  }

  return serializeNursery(nursery)
})
