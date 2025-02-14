import type { INursery } from '~/server/types/nursery'

export const useNurseries = () => {
  const nurseries = useState<INursery[]>('nurseries', () => [])

  const { data } = useAsyncData<INursery[]>('nurseries', async () => {
    const response = await $fetch<INursery[]>('/api/nurseries')
    return response ?? []
  })

  nurseries.value = data.value ?? []

  return { nurseries }
}
