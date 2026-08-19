<script setup lang="ts">
const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>

// 絞り込みと並び替えは3ページで共用している (#134)
const filters = useNurseryFilters()

const links = [
  {
    label: 'トップ',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: '認可保育所一覧',
    icon: 'i-heroicons-building-office-2',
    to: '/nurseries',
  },
]

useHead({
  title: '認可保育所一覧',
})
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :items="links"
    />
    <h2 class="text-3xl font-bold text-center mb-4">
      認可保育所一覧
    </h2>
    <!--
      エリアは一覧の主導線 (#86)。
      下のフィルターがこの画面を絞るのに対し、こちらはエリア別ページへの入口で、
      URLを共有できる・検索エンジンに拾われるという別の役割を持つ。
    -->
    <section class="container mb-4">
      <h3 class="text-sm font-medium text-muted mb-2">
        <ULink
          to="/nurseries/area"
          class="underline underline-offset-2 hover:text-default"
        >エリアから探す</ULink>
      </h3>
      <!--
        エリア別ページの導線と見た目を揃えている（丸型・アイコン付き）。
        以前は size="sm" の素のボタンで、「桜」のような短いラベルだと 32×28px しかなく
        指では狙いにくかった (#129)。min-h-10 で押せる面を確保する。
      -->
      <nav
        class="flex flex-wrap gap-2"
        aria-label="エリア"
      >
        <UButton
          v-for="area in globalAreas"
          :key="area.alphabet"
          :to="`/nurseries/area/${area.alphabet}`"
          :icon="area.icon"
          color="neutral"
          variant="outline"
          size="sm"
          class="min-h-10 rounded-full font-bold"
        >
          {{ area.name }}
        </UButton>
      </nav>
    </section>

    <NurseryFilterPanel :filters="filters" />

    <section>
      <NurseryCardList
        :nurseries="filters.sorted.value"
        :status="filters.status.value"
        :total="filters.nurseries.value?.length"
      />
    </section>
    <UContainer class="text-right">
      <ULink
        to="/"
        class="underline"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >トップページへ</ULink>
    </UContainer>
  </main>
</template>
