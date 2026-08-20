<script setup lang="ts">
// app/types/ は Nuxt の自動 import の対象外（値と違い型は解決されない）ので明示的に import する
import type { NurseryAreaRouteParams } from '~/types/route'

const route = useRoute()
const params = route.params as Partial<NurseryAreaRouteParams>
const areaAlphabet = params.area ?? ''

const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>
const area = globalAreas.find(a => a.alphabet === areaAlphabet)

if (!area) {
  throw createError({ statusCode: 404, statusMessage: 'Area Not Found', message: 'エリアが見つかりません', fatal: true })
}

/*
 * 専用のAPIは足していない。全件を1回取ってクライアントで絞る。
 * key は一覧ページと同じ 'nurseries' なので、一覧から遷移してきた場合は追加の
 * リクエストが発生しない。
 *
 * エリアはパスで決まっているので fixed に渡す。セレクトは出さず、クエリにも書かない (#134)。
 * これにより /nurseries/area/banpaku?area=midorino のような矛盾したURLを作れない。
 */
const filters = useNurseryFilters({ area: areaAlphabet })

/** このエリアの施設。件数の母数と要約の両方で使う */
const areaNurseries = computed(() =>
  filters.nurseries.value?.filter(nursery => nursery.area_alphabet === areaAlphabet) ?? [],
)

/** 「N件 / 全M件」の母数。このページではエリア内の件数が全件にあたる */
const areaTotal = computed(() => filters.nurseries.value ? areaNurseries.value.length : undefined)

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
    label: area!.name,
    icon: 'i-heroicons-map',
  },
]

useHead({
  title: `認可保育所一覧 ${area!.name}`,
})

/*
 * エリアの説明（runtimeConfig の description）を description の主文にしている。
 * 7エリアで文言が被らず、かつ範囲の説明が検索結果に出る。
 */
useSeoMeta({
  description: () => `つくば市${area!.name}エリアの認可保育所${areaTotal.value ?? ''}園を一覧で紹介します。${area!.description}。受入年齢・一時預かり・送迎バスなどで絞り込めます。`,
})

const site = useSiteConfig()

/*
 * ページ自体の更新日 (#151)。掲載データは月1のオープンデータ取り込みでしか
 * 変わらないので、検索エンジンが再クロールの要否を判断できるように出しておく。
 */
useHead(() => ({
  script: [jsonLdScript(buildWebPageSchema({
    url: `${site.url}/nurseries/area/${areaAlphabet}`,
    name: `認可保育所一覧 ${area!.name}`,
    siteUrl: site.url,
    dateModified: latestDataUpdate(areaNurseries.value),
  }))],
}))
</script>

<template>
  <main class="py-4">
    <AppBreadcrumb
      :items="links"
    />
    <h1 class="text-3xl font-bold text-center mb-1">
      {{ area!.name }}
    </h1>
    <p class="text-center text-sm text-muted mb-4">
      {{ area!.description }}
    </p>

    <!-- 主導線はエリアなので、他のエリアへは一覧に戻らず直接移れるようにする -->
    <nav
      class="container flex flex-wrap justify-center gap-2"
      aria-label="ほかのエリア"
    >
      <UButton
        v-for="other in globalAreas"
        :key="other.alphabet"
        :to="`/nurseries/area/${other.alphabet}`"
        :color="other.alphabet === areaAlphabet ? 'primary' : 'neutral'"
        :variant="other.alphabet === areaAlphabet ? 'subtle' : 'outline'"
        :icon="other.icon"
        size="sm"
        class="min-h-10 rounded-full font-bold"
        :aria-current="other.alphabet === areaAlphabet ? 'page' : undefined"
      >
        {{ other.name }}
      </UButton>
    </nav>

    <div class="mt-4">
      <NurseryFilterPanel
        :filters="filters"
        id-prefix="area"
      />
    </div>

    <NurseryCardList
      :nurseries="filters.sorted.value"
      :status="filters.status.value"
      :total="areaTotal"
    />
    <!--
      要約はカードの下に置く (#145 / #148)。
      スマホのファーストビューに1枚目のカードを入れるために絞り込みを畳んだ経緯があり、
      ここに文章を積むとその努力を打ち消してしまう。
      検索エンジンはページ全体を読むので、下部でも内容としては同じに扱われる。
    -->
    <NurserySummaryPanel
      :title="`${area!.name}エリアの認可保育所`"
      :lead="`${area!.description}。`"
      :nurseries="areaNurseries"
      related-axis="district"
    />

    <UContainer class="text-right">
      <ULink
        to="/nurseries"
        class="underline"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >認可保育所一覧へ</ULink>
    </UContainer>
  </main>
</template>
