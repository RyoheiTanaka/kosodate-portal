<script setup lang="ts">
const { nurseries } = useNurseries()
const isMounted = ref(false)

const randomShops = computed(() => [...nurseries.value].sort(() => Math.random() - 0.5).slice(0, 5))

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <main>
    <div class="relative mx-auto">
      <NuxtImg
        width="1400"
        height="800"
        class="object-cover w-full h-[420px] lg:h-[560px] xl:h-[640px]"
        src="/images/main-visual.jpg"
        alt="Hero image"
        loading="eager"
        sizes="sm:100vw md:1400px"
        fetchpriority="high"
        preload
        placeholder
        placeholder-class="blur-xl"
      />
      <div class="container absolute inset-0 flex flex-col items-start justify-center bg-gradient-to-l from-gray-200 md:bg-none">
        <h1 class="text-3xl font-bold md:mb-4 md:text-4xl lg:text-6xl">
          子育てポータル
        </h1>
        <h2 class="text-lg font-bold md:mb-4 lg:text-3xl">
          子育て情報掲載サイト
        </h2>
        <div class="max-w-sm mb-8 text-md font-light lg:max-w-md text-balance">
          <p>つくば市が公開しているデータをまとめて掲載しています。</p>
        </div>
        <NuxtLink
          class="px-6 py-3 font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-800"
          to="/license"
        >掲載情報詳細はこちら</NuxtLink>
      </div>
    </div>
    <div class="py-6 container">
      <h3 class="text-2xl font-bold text-center mb-4">
        認可保育所
      </h3>

      <UCarousel
        v-if="isMounted"
        v-slot="{ item }"
        :items="randomShops"
        :ui="{ container: 'p-3', item: 'basis-full sm:basis-1/2 md:basis-1/3' }"
        arrows
        indicators
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
    </div>
    <div class="container text-right py-6">
      <ULink
        class="underline "
        to="/nurseries"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >認可保育所一覧へ</ULink>
    </div>
  </main>
</template>
