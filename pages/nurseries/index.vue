<script setup lang="ts">
const { nurseries } = useNurseries()
const isMounted = ref(false)

const districtnurseries = computed(() => groupBy(nurseries.value, 'district'))

function groupBy<T extends Record<K, string | number>, K extends keyof T>(
  items: T[],
  key: K,
): Record<string, T[]> {
  return items.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold text-center mb-4">
      保育所一覧
    </h2>
    <template v-if="isMounted">
      <UContainer
        v-for="(districtnursery, index) in districtnurseries"
        :key="index"
        class="py-6 w-full max-w-screen-2xl mx-auto"
      >
        <h3 class="text-2xl font-bold text-center mb-4">
          {{ index }}
        </h3>

        <UCarousel
          v-slot="{ item }"
          :items="districtnursery"
          :ui="{ container: 'py-3', item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
          arrows
          indicators
        >
          <UCard class="p-4 mx-auto max-w-md">
            <template #header>
              <h4 class="text-lg font-semibold text-center">
                <ULink
                  :to="`nurseries/${item._id}`"
                  class="underline"
                >{{ item.name }}
                </ULink>
              </h4>
            </template>
            <p><strong>区分:</strong> {{ item.classification }}</p>
            <p><strong>種別:</strong> {{ item.type }}</p>
            <p><strong>住所:</strong> {{ item.address1 }}</p>
            {{ item.image }}
            <img
              src="~/assets/no_image.png"
              alt="保育所画像"
              class="mt-2 w-full h-40 object-cover rounded-lg"
            >
            <ULink
              :to="`nurseries/${item._id}`"
              class="block text-right underline"
              active-class="text-primary"
              inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              詳細へ
            </ULink>
          </UCard>
        </UCarousel>
      </UContainer>
    </template>
    <div>
      <ULink
        to="/"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >トップページへ</ULink>
    </div>
  </div>
</template>
