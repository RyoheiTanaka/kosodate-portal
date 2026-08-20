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

/*
 * 絞り込みと並び替えはクエリに出るが、内容は同じ一覧なので canonical は
 * クエリを落とした /nurseries に統一する (#151)。
 * nuxt-seo-utils が既定で出す canonical もクエリを含まないが、意図を明示するために
 * ここで固定している。
 */
useSeoMeta({
  description: 'つくば市の認可保育所119園を一覧で探せます。エリア・受入年齢・一時預かり・送迎バスなどで絞り込み、現在地からの距離順にも並び替えられます。市のオープンデータをもとにしています。',
})

const site = useSiteConfig()

/*
 * ページ自体の更新日 (#151)。掲載データは月1のオープンデータ取り込みでしか
 * 変わらないので、検索エンジンが再クロールの要否を判断できるように出しておく。
 */
useHead(() => ({
  script: [jsonLdScript(buildWebPageSchema({
    url: `${site.url}/nurseries`,
    name: '認可保育所一覧',
    siteUrl: site.url,
    dateModified: latestDataUpdate(filters.nurseries.value ?? []),
  }))],
}))
</script>

<template>
  <main class="pt-2 pb-4 sm:pt-4">
    <AppBreadcrumb
      :items="links"
    />
    <h1 class="text-3xl font-bold text-center mb-2 sm:mb-4">
      認可保育所一覧
    </h1>
    <!--
      エリアは一覧の主導線 (#86)。
      下のフィルターがこの画面を絞るのに対し、こちらはエリア別ページへの入口で、
      URLを共有できる・検索エンジンに拾われるという別の役割を持つ。
    -->
    <section class="container mb-4">
      <h2 class="text-sm font-medium text-muted mb-2">
        <ULink
          to="/nurseries/area"
          class="underline underline-offset-2 hover:text-default"
        >エリアから探す</ULink>
      </h2>
      <!-- 現在地は無い。ここは一覧そのもので、どのエリアにも属していない -->
      <NurseryChipNav
        :items="globalAreas"
        base-path="/nurseries/area"
        label="エリア"
      />
    </section>

    <NurseryBrowser
      :filters="filters"
      :total="filters.nurseries.value?.length"
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
