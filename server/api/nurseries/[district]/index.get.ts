import { Nursery } from '~~/server/models/Nursery'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const district = event.context.params?.district
  const globalDistricts = config.public.globalDistricts as Array<District>
  const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district)

  if (!district || !globalDistrict) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid District' })
  }

  await connectDB()

  // 閉園した施設は一覧に含めない（詳細ページはURL維持のため残す）
  const nurseries = await Nursery.find({ district_alphabet: district, is_active: { $ne: false } })
  if (!nurseries) {
    throw createError({ statusCode: 404, statusMessage: 'Nursery not found' })
  }

  return nurseries
})
