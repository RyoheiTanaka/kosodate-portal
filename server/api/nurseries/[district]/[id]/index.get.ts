import { defineEventHandler, createError } from 'h3'
import { connectDB } from '~/server/utils/mongo'
import { Nursery } from '~/server/models/Nursery'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  await connectDB()

  const nursery = await Nursery.findOne({ nursery_id: id })
  if (!nursery) {
    throw createError({ statusCode: 404, statusMessage: 'Nursery not found' })
  }

  return nursery
})
