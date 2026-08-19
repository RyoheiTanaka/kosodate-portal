<script setup lang="ts">
/*
 * エリアの一覧。
 *
 * エリア別ページの親にあたるURLなので、置かないと /nurseries/area が
 * /nurseries/[district]（district = "area"）に吸われて、見出しも件数も空のページが
 * 200 で返ってしまう。エリアが主導線である以上、ここは入口として使えるほうがよい (#86)。
 */
const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>

const { data: nurseries, status } = useNurseries()

const countByArea = computed(() => {
  const counts: Record<string, number> = {}
  for (const nursery of nurseries.value ?? []) {
    counts[nursery.area_alphabet] = (counts[nursery.area_alphabet] ?? 0) + 1
  }
  return counts
})

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
  {
    label: 'エリアから探す',
    icon: 'i-heroicons-map',
  },
]

useHead({
  title: 'エリアから探す',
})
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :items="links"
    />
    <h2 class="text-3xl font-bold text-center mb-1">
      エリアから探す
    </h2>
    <p class="text-center text-sm text-muted mb-6">
      つくば市の認可保育所等を、TXの駅と生活圏を軸にした7エリアに分けています。
    </p>
    <UContainer class="max-w-(--breakpoint-xl)">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <!-- 読み込み中に 0 件と出すと「その区分には無い」と読めてしまうので、件数は伏せて渡す -->
        <AreaCard
          v-for="area in globalAreas"
          :key="area.alphabet"
          :area="area"
          :count="status === 'pending' ? undefined : (countByArea[area.alphabet] ?? 0)"
        />
      </div>
    </UContainer>
    <UContainer class="text-right mt-6">
      <ULink
        to="/nurseries"
        class="underline"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >認可保育所一覧へ</ULink>
    </UContainer>
  </main>
</template>
