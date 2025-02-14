<script setup lang="ts">
const { nurseries } = useNurseries()

const randomShops = computed(() => [...nurseries.value].sort(() => Math.random() - 0.5).slice(0, 5))
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold text-center mb-4">
      トップページ
    </h2>
    <UContainer class="py-6 w-full max-w-screen-2xl mx-auto">
      <h3 class="text-2xl font-bold text-center mb-4">
        保育所一覧
      </h3>

      <UCarousel
        v-slot="{ item }"
        :items="randomShops"
        :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
      >
        <UCard
          class="p-4 mx-auto max-w-md"
        >
          <template #header>
            <h4 class="text-lg font-semibold text-center">
              {{ item.name }}
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
    <ULink
      class="block text-right underline"
      to="/nurseries"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >保育所一覧へ</ULink>
  </div>
</template>
