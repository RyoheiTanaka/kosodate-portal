import type { INursery } from '~/server/types/nursery'

export const useNurseries = (keyword: string) => {
  return useAsyncData<INursery[] | null>(`nurseries-${keyword}`, async () => {
    const query = keyword ? `?keyword=${keyword}` : ''
    const { data } = await useFetch<INursery[]>(`/api/nurseries/${query}`)
    return data.value ?? null
  })
}
