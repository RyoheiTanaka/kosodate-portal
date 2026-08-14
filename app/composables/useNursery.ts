import type { INursery } from '~/server/types/nursery'

export const useNursery = (district: string, id: string) => {
  return useAsyncData<INursery | null>(`nursery-${district}-${id}`, async () => {
    const { data } = await useFetch<INursery>(`/api/nurseries/${district}/${id}`)
    return data.value
  })
}
