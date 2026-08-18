import type { INursery } from '~~/server/types/nursery'

export const useDistrictNurseries = (district: string) => {
  return useFetch<INursery[]>(`/api/nurseries/${district}`, {
    key: `nurseries-${district}`,
  })
}
