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
 * 地区別ページと違い、専用のAPIは足していない。
 *
 * 全119件を1回取ってクライアントで絞るほうが、キーワード検索や他の条件と
 * 組み合わせたときに一覧ページと同じ経路に乗せられる。#106 で一覧の絞り込みを
 * クライアント側 + URLクエリに一本化する予定なので、いまサーバー側に
 * エリア専用のエンドポイントを足すと、そこで作り直しになる。
 *
 * key は一覧ページの useNurseries('') と同じになるため、
 * 一覧から遷移してきた場合は追加のリクエストが発生しない。
 */
const { data: nurseries, status } = useNurseries('')

const areaNurseries = computed(() =>
  nurseries.value?.filter(nursery => nursery.area_alphabet === areaAlphabet) ?? [],
)

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
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :items="links"
    />
    <h2 class="text-3xl font-bold text-center mb-1">
      {{ area!.name }}
    </h2>
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
        class="rounded-full font-bold"
        :aria-current="other.alphabet === areaAlphabet ? 'page' : undefined"
      >
        {{ other.name }}
      </UButton>
    </nav>

    <NurseryCardList
      :nurseries="areaNurseries"
      :status="status"
    />
    <UContainer class="text-right">
      <ULink
        to="/nurseries"
        class="underline"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >認可保育所一覧へ</ULink>
    </UContainer>
  </main>
</template>
