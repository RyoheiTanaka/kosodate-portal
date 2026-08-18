import type { INursery } from '~~/server/types/nursery'

export const useNursery = (district: string, id: string) => {
  return useFetch<INursery>(`/api/nurseries/${district}/${id}`, {
    key: `nursery-${district}-${id}`,
  })
}
