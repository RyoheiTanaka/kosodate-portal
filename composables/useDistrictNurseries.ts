import type { INursery } from '~/server/types/nursery'

export const useDistrictNurseries = (district: string) => {
  return useAsyncData<INursery[] | null>(`nurseries-${district}`, async () => {
    const { data } = await useFetch<INursery[]>(`/api/nurseries/${district}`)
    return data.value ?? null
  })
}
