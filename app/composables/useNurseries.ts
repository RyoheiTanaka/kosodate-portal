import type { INursery } from '~~/server/types/nursery'

export const useNurseries = (keyword: string) => {
  return useFetch<INursery[]>('/api/nurseries', {
    key: `nurseries-${keyword}`,
    query: keyword ? { keyword } : undefined,
  })
}
