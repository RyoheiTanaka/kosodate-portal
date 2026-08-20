<script setup lang="ts">
const links = [
  {
    label: 'トップ',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'ライセンス',
    icon: 'i-heroicons-document',
  },
]

useHead({
  title: 'ライセンス',
})

useSeoMeta({
  description: '子育てポータルは、つくば市のオープンデータ「認可保育所等一覧」をクリエイティブ・コモンズ表示4.0国際のもとで改変して利用しています。出典と免責事項を掲載しています。',
})
</script>

<template>
  <main class="py-4">
    <AppBreadcrumb
      :items="links"
    />
    <UContainer class="max-w-(--breakpoint-xl) w-full">
      <UCard>
        <template #header>
          <h2 class="text-3xl font-bold text-center">
            ライセンス・クレジット表記
          </h2>
        </template>
        <!--
          つくば市オープンデータ利用規約が指定する「改変して利用する場合」の出典表記。
          語順と区切りは規約の指定に合わせている。詳細は CreativeCommons.vue のコメント
          および issue #113 を参照。
        -->
        <div class="mt-4">
          <h3 class="text-xl font-bold">
            出典
          </h3>
          <p class="mt-2">
            このサイトは以下の著作物を改変して利用しています。
          </p>
          <ul class="pl-0 mt-4 ml-4 list-disc">
            <li class="mb-2">
              <ULink
                to="https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005842.html"
                target="_blank"
                class="underline"
                active-class="text-primary"
                inactive-class="text-muted hover:text-default"
              >認可保育所等一覧</ULink>、つくば市、<ULink
                to="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                class="underline"
                active-class="text-primary"
                inactive-class="text-muted hover:text-default"
              >クリエイティブ・コモンズ・ライセンス表示4.0国際</ULink>
            </li>
          </ul>
          <p class="mt-2 text-sm">
            利用条件は
            <ULink
              to="https://www.city.tsukuba.lg.jp/opendata/1000081/1000084.html"
              target="_blank"
              class="underline"
              active-class="text-primary"
              inactive-class="text-muted hover:text-default"
            >つくば市オープンデータ利用規約</ULink>
            によります。
          </p>
        </div>
        <div class="mt-8">
          <h3 class="text-xl font-bold">
            免責事項
          </h3>
          <p class="mt-2">
            掲載しているデータは、つくば市が公開しているものを転載・改変したものです。
            つくば市はデータの完全性・正確性・網羅性・安全性を保証しておらず、
            データの利用によって生じた損害について責任を負いません。
          </p>
          <p class="mt-2">
            当サイトも掲載内容の正確性を保証するものではありません。
            申し込みや入所の判断にあたっては、必ずつくば市の公式情報および各施設に直接ご確認ください。
          </p>
        </div>
      </UCard>
    </UContainer>
  </main>
</template>
