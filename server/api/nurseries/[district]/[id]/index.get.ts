import { defineEventHandler, createError } from 'h3'
import mongoose from 'mongoose'
import { connectDB } from '~/server/utils/mongo'
import { Nursery } from '~/server/models/Nursery'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  await connectDB()
  const nursery = await Nursery.findById(id)
  if (!nursery) {
    throw createError({ statusCode: 404, statusMessage: 'Nursery not found' })
  }

  return nursery
})
