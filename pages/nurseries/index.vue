<script setup lang="ts">
const nurseries = [
  {
    id: 1,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 2,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 3,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 4,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 5,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 6,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 7,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 8,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 9,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
  {
    id: 10,
    classification: '公立',
    type: '保育所',
    name: '大穂保育所',
    address1: '大曽根',
  },
]
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold text-center mb-4">
      保育所一覧
    </h2>
    <UContainer class="py-6 w-full max-w-screen-2xl mx-auto">
      <h3 class="text-2xl font-bold text-center mb-4">
        大曽根
      </h3>

      <UCarousel
        v-slot="{ item }"
        :items="nurseries"
        :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
      >
        <UCard class="p-4 mx-auto max-w-md">
          <template #header>
            <h4 class="text-lg font-semibold text-center">
              <ULink
                :to="`nurseries/${item.id}`"
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
            :to="`nurseries/${item.id}`"
            class="block text-right underline"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            詳細へ
          </ULink>
        </UCard>
      </UCarousel>
    </UContainer>
    <UContainer class="py-6 w-full max-w-screen-2xl mx-auto">
      <h3 class="text-2xl font-bold text-center mb-4">
        上郷
      </h3>

      <UCarousel
        v-slot="{ item }"
        :items="nurseries"
        :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
      >
        <UCard class="p-4 mx-auto max-w-md">
          <template #header>
            <h4 class="text-lg font-semibold text-center">
              <ULink
                :to="`nurseries/${item.id}`"
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
            :to="`nurseries/${item.id}`"
            class="block text-right underline"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            詳細へ
          </ULink>
        </UCard>
      </UCarousel>
    </UContainer>
    <div>
      <ULink
        to="/"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >トップページへ</ULink>
    </div>
    <div>
      <ULink
        to="/nurseries/1"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >保育所詳細1へ</ULink>
    </div>
  </div>
</template>
