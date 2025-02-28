import { defineEventHandler, createError } from 'h3'
import { connectDB } from '~/server/utils/mongo'
import { Nursery } from '~/server/models/Nursery'
import type { District } from '~/types/global'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const district = event.context.params?.district
  const globalDistricts = config.public.globalDistricts as Array<District>
  const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district)

  if (!district || !globalDistrict) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid District' })
  }

  await connectDB()

  const nurseries = await Nursery.find({ district_alphabet: district })
  if (!nurseries) {
    throw createError({ statusCode: 404, statusMessage: 'Nursery not found' })
  }

  return nurseries
})
