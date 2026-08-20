<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

/*
 * 画面のパンくずと、検索エンジン向けの BreadcrumbList を同時に出す (#151)。
 *
 * 9ページが同じ形で UBreadcrumb を置いていたので、構造化データを足すついでに
 * ここへまとめた。画面と構造化データが同じ配列から作られるので、片方だけ
 * 変わってしまうことがない。
 */
const props = defineProps<{
  items: BreadcrumbItem[]
}>()

const site = useSiteConfig()

useHead(() => ({
  script: [
    jsonLdScript({
      '@type': 'BreadcrumbList',
      'itemListElement': props.items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.label,
        /*
         * 最後の項目（現在地）には to が無い。現在地のURLは省略してよいので、
         * item を持たせずに name だけ出す。
         */
        ...(item.to ? { item: `${site.url}${item.to}` } : {}),
      })),
    }),
  ],
}))
</script>

<template>
  <UBreadcrumb
    class="container pb-4"
    :items="items"
  />
</template>
