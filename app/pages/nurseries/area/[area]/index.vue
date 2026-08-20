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

/*
 * エリアの要約 (#151)。7エリアのページが見出しと施設リスト以外ほぼ同じで、
 * 検索エンジンからは同じ内容のページが7つあるように見えていた。
 * 掲載データから数えた事実だけを置く。地域の紹介文を書き起こすと、
 * 駅からの徒歩分数のような手元に無い情報を書くことになる。
 */
const summary = computed(() => buildAreaSummary(areaNurseries.value))

/*
 * 送迎バスの null は「不明」であって「無し」ではない。
 * 公立は市が情報を公開していないので、不明の件数も添える (#151)。
 */
const shuttleBusText = computed(() => {
  const { shuttleBus, shuttleBusUnknown } = summary.value

  return shuttleBusUnknown > 0
    ? `送迎バスがある園: ${shuttleBus}園（ほかに有無が不明な園が${shuttleBusUnknown}園あります）`
    : `送迎バスがある園: ${shuttleBus}園`
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

    <!--
      要約は絞り込みより前に置く。このエリアがどういう構成なのかを先に示してから
      道具（絞り込み）を出す順にしている。
    -->
    <UContainer class="mt-4">
      <section
        v-if="summary.total > 0"
        class="rounded-lg border border-default p-4"
      >
        <h2 class="font-bold mb-2">
          {{ area!.name }}エリアの認可保育所
        </h2>
        <p class="text-sm text-muted mb-3">
          {{ area!.description }}。掲載している認可保育所は{{ summary.total }}園です。
        </p>
        <ul class="text-sm space-y-1 list-disc ml-5">
          <li>区分: {{ formatAreaCounts(summary.classifications) }}</li>
          <li>種別: {{ formatAreaCounts(summary.types) }}</li>
          <li>0歳児クラスがある園: {{ summary.fromZero }}園</li>
          <li>一時預かりを行っている園: {{ summary.temporaryCare }}園</li>
          <!--
            送迎バスの null は「不明」であって「無し」ではない。
            公立は市が情報を公開していないので、件数を分けて出す (#151)
          -->
          <li>{{ shuttleBusText }}</li>
          <li>掲載している地域: {{ summary.oaza.join('・') }}</li>
        </ul>
        <p class="text-xs text-muted mt-3">
          件数はつくば市が公開しているデータ（{{ formatSourceDate(areaNurseries[0]?.source_date) || '公開時点' }}時点）をもとにしています。
        </p>
      </section>
    </UContainer>

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
