<script setup lang="ts">
const route = useRoute()
const keyword = ref<string>(route.query.keyword as string || '')

/**
 * 「すべて」を表す番兵。
 * reka-ui の SelectItem は空文字の value を許さない（空文字は選択解除の意味を持つ）ため、
 * v3 のように value: '' の選択肢を置けない。
 */
const ALL = 'all'

const classificationFilter = ref(ALL)
const keywordFilter = ref('')
const typeFilter = ref(ALL)
const areaFilter = ref(ALL)

const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>

// エリアは一覧の主導線 (#86)。区分・種別より前に置く
const areaOptions = [
  { label: 'すべてのエリア', value: ALL },
  ...globalAreas.map(area => ({ label: area.name, value: area.alphabet })),
]

// USelect の既定の labelKey は label なので、v3 の name から付け替えている
const classificationOptions = [
  {
    label: 'すべての区分',
    value: ALL,
  },
  {
    label: '公立',
    value: '公立',
  },
  {
    label: '民間',
    value: '民間',
  },
]

const typeOptions = [
  {
    label: 'すべての種別',
    value: ALL,
  },
  {
    label: '保育所',
    value: '保育所',
  },
  {
    label: '認定こども園',
    value: '認定こども園',
  },
  {
    label: '小規模保育事業所',
    value: '小規模保育事業所',
  },
]
const { data: nurseries, status } = useNurseries(keyword.value)

const filteredNurseries = computed(() => {
  if (!nurseries.value) return []

  return nurseries.value.filter((nursery) => {
    const matchClassification = classificationFilter.value === ALL || nursery.classification === classificationFilter.value
    const matchKeyword = !keywordFilter.value || nursery.name.includes(keywordFilter.value)
    const matchType = typeFilter.value === ALL || nursery.type === typeFilter.value
    const matchArea = areaFilter.value === ALL || nursery.area_alphabet === areaFilter.value

    return matchClassification && matchKeyword && matchType && matchArea
  })
})

/** 1つでも絞り込みが効いていればリセットを出す */
const hasActiveFilters = computed(() =>
  keywordFilter.value !== ''
  || classificationFilter.value !== ALL
  || typeFilter.value !== ALL
  || areaFilter.value !== ALL,
)

const resetFilters = () => {
  keywordFilter.value = ''
  classificationFilter.value = ALL
  typeFilter.value = ALL
  areaFilter.value = ALL
}

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
      <nav
        class="flex flex-wrap gap-2"
        aria-label="エリア"
      >
        <UButton
          v-for="area in globalAreas"
          :key="area.alphabet"
          :to="`/nurseries/area/${area.alphabet}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          {{ area.name }}
        </UButton>
      </nav>
    </section>
    <!--
      フィルターは一覧を絞るための道具なので、主役であるカードより目立たせない。
      見出しは支援技術のために残しつつ、視覚的には控えめなツールバーとして扱う。
    -->
    <section class="container">
      <h3 class="sr-only">
        絞り込み
      </h3>
      <div class="rounded-lg border border-default p-4 flex flex-col gap-4 md:flex-row md:items-end">
        <UFormField
          label="名前"
          class="md:flex-1"
        >
          <UInput
            v-model="keywordFilter"
            variant="outline"
            icon="i-heroicons-magnifying-glass"
            placeholder="名前を入力してください"
            class="w-full"
          />
        </UFormField>
        <UFormField label="エリア">
          <USelect
            v-model="areaFilter"
            :items="areaOptions"
            class="w-full md:w-56"
          />
        </UFormField>
        <UFormField label="区分">
          <USelect
            v-model="classificationFilter"
            :items="classificationOptions"
            class="w-full md:w-44"
          />
        </UFormField>
        <UFormField label="種別">
          <USelect
            v-model="typeFilter"
            :items="typeOptions"
            class="w-full md:w-52"
          />
        </UFormField>
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="resetFilters"
        >
          条件をクリア
        </UButton>
      </div>
    </section>
    <section>
      <NurseryCardList
        :nurseries="filteredNurseries"
        :status="status"
        :total="nurseries?.length"
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
