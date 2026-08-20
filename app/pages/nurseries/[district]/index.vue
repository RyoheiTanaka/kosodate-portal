<script setup lang="ts">
// app/types/ は Nuxt の自動 import の対象外（値と違い型は解決されない）ので明示的に import する
import type { NurseryRouteParams } from '~/types/route'

const route = useRoute()
const params = route.params as Partial<NurseryRouteParams>
const district = params.district ?? ''

const config = useRuntimeConfig()
const globalDistricts = config.public.globalDistricts as Array<District>
const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district) || { alphabet: '', name: '' }
const districtName = globalDistrict.name

/*
 * 以前は useDistrictNurseries（/api/nurseries/[district]）で地区分だけ取っていたが、
 * 全件取得に切り替えた (#134)。
 *
 * 絞り込みをクライアント側でやる以上、全件が手元に無いとキーワードや他の条件と
 * 合成できない。key は一覧ページと同じ 'nurseries' なので、一覧やエリア別ページから
 * 遷移してきた場合はリクエストが1つ減る。
 *
 * 地区はパスで決まっているので fixed に渡す。セレクトは出さず、クエリにも書かない。
 */
const filters = useNurseryFilters({ district })

/** この地区の施設。件数の母数と要約の両方で使う */
const districtNurseries = computed(() =>
  filters.nurseries.value?.filter(nursery => nursery.district_alphabet === district) ?? [],
)

/** 「N件 / 全M件」の母数。このページでは地区内の件数が全件にあたる */
const districtTotal = computed(() => filters.nurseries.value ? districtNurseries.value.length : undefined)

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
    label: districtName,
    icon: 'i-heroicons-clipboard-document-list',
  },
]

useHead({
  title: `認可保育所一覧 ${districtName}`,
})

useSeoMeta({
  description: () => `つくば市${districtName}の認可保育所${districtTotal.value ?? ''}園を一覧で紹介します。受入年齢・一時預かり・送迎バスなどで絞り込み、現在地からの距離順にも並び替えられます。`,
})
</script>

<template>
  <main class="py-4">
    <AppBreadcrumb
      :items="links"
    />
    <h1 class="text-3xl font-bold text-center mb-4">
      {{ districtName }}
    </h1>

    <!--
      地区別ページには他の地区へ移る手段が無く、トップか一覧まで戻る必要があった。
      エリア別ページには同じ形の導線が既にあるので、それに揃えている。

      主導線はエリアなので (#86)、ここにエリアの導線は置かない。
      地区で見に来た人が地区の中で移動できれば足りる。
    -->
    <nav
      class="container flex flex-wrap justify-center gap-2 mb-4"
      aria-label="ほかの地区"
    >
      <UButton
        v-for="other in globalDistricts"
        :key="other.alphabet"
        :to="`/nurseries/${other.alphabet}`"
        :color="other.alphabet === district ? 'primary' : 'neutral'"
        :variant="other.alphabet === district ? 'subtle' : 'outline'"
        icon="i-lucide-map-pin"
        size="sm"
        class="min-h-10 rounded-full font-bold"
        :aria-current="other.alphabet === district ? 'page' : undefined"
      >
        {{ other.name }}
      </UButton>
    </nav>

    <NurseryFilterPanel
      :filters="filters"
      id-prefix="district"
    />

    <NurseryCardList
      :nurseries="filters.sorted.value"
      :status="filters.status.value"
      :total="districtTotal"
    />
    <!--
      要約はカードの下に置く (#145 / #148)。
      スマホのファーストビューに1枚目のカードを入れるために絞り込みを畳んだ経緯があり、
      ここに文章を積むとその努力を打ち消してしまう。
      検索エンジンはページ全体を読むので、下部でも内容としては同じに扱われる。
    -->
    <NurserySummaryPanel
      :title="`${districtName}の認可保育所`"
      lead="つくば市の公式区分による地区です。"
      :nurseries="districtNurseries"
    />

    <UContainer class="text-right">
      <ULink
        to="/"
        class="underline"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >トップページへ</ULink>
    </UContainer>
  </main>
</template>
