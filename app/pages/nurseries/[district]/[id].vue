<script setup lang="ts">
// app/types/ は Nuxt の自動 import の対象外（値と違い型は解決されない）ので明示的に import する
import type { NurseryRouteParams } from '~/types/route'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const route = useRoute()
const params = route.params as Partial<NurseryRouteParams>
const district = params.district ?? ''
const id = params.id ?? ''

const config = useRuntimeConfig()
const globalDistricts = config.public.globalDistricts as Array<District>
const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district) || { alphabet: '', name: '' }

/*
 * 実在しない地区スラッグは404 (#151)。
 * データがどう変わっても正しくなることはないURLなので、リダイレクトの余地は無い。
 * エリア別ページ（app/pages/nurseries/area/[area]/index.vue）と扱いを揃えている。
 */
if (!globalDistricts.some(candidate => candidate.alphabet === district)) {
  throw createError({ statusCode: 404, statusMessage: 'District Not Found', message: '地区が見つかりません', fatal: true })
}

/*
 * リダイレクトの判定に施設のデータが要るので、ここは await する。
 * await しないと nursery.value は null のままで、判定が常に素通りする。
 */
const { data: nursery, error } = await useNursery(district, id)

/*
 * 施設が存在しない（API が404）、または nursery_id が数値でない（API が400）。
 * 以前はどちらも200で、見出しも本文も無いページが返っていた。
 */
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Nursery Not Found', message: '施設が見つかりません', fatal: true })
}

/*
 * URL の主キーは nursery_id で、district は表示用のスラッグにすぎない。
 * 詳細APIが district を見ていないため /nurseries/oho/25 でも谷田部の施設が開けるので、
 * 施設本来の地区URLへ恒久リダイレクトして1本に寄せる (#151)。
 *
 * 404 ではなく301にしているのは、district_alphabet が住所の大字から導出した値で、
 * データ側の見直しで変わりうるため。404 にすると旧URLが即座に死ぬが、
 * 301なら外部リンクや検索エンジンの評価を新URLへ引き継げる。
 */
if (nursery.value && nursery.value.district_alphabet !== district) {
  await navigateTo(
    `/nurseries/${nursery.value.district_alphabet}/${nursery.value.nursery_id}`,
    { redirectCode: 301 },
  )
}

const detailRows = computed(() => nursery.value ? buildNurseryDetailRows(nursery.value) : [])

// オブジェクトで渡すと fetch 解決前の undefined がその場の値として固定され、
// 全詳細ページの title が `子育てポータル` のままになる (#151)。関数で渡して追従させる。
useHead(() => ({
  title: nursery.value?.name,
}))

const site = useSiteConfig()

/** 正規URL。施設本来の地区で組み立てる。canonical と構造化データで共用する */
const canonicalUrl = computed(() =>
  nursery.value
    ? `${site.url}/nurseries/${nursery.value.district_alphabet}/${nursery.value.nursery_id}`
    : '',
)

/*
 * 詳細APIは nursery_id だけで引いており、URLの district は見ていない。
 * そのため /nurseries/oho/25 と /nurseries/yatabe/25 が同じ施設を返す。
 * 施設が実際に属する地区のURLを canonical に指定して、重複を1本に寄せる (#151)。
 */
useHead(() => ({
  link: canonicalUrl.value
    ? [{ rel: 'canonical', href: canonicalUrl.value }]
    : [],
}))

useSeoMeta({
  description: () => nursery.value ? buildNurseryDescription(nursery.value) : undefined,
})

/*
 * 施設の構造化データ (#151)。住所・電話・座標・開所時間はすべて既存のフィールドから出す。
 * 評価や料金は持っていないので出さない。
 */
useHead(() => ({
  script: nursery.value
    ? [
        jsonLdScript(buildNurserySchema(nursery.value, canonicalUrl.value)),
        /*
         * ページ自体の更新日 (#151)。データは月1のオープンデータ取り込みでしか
         * 変わらないので、再クロールの要否を判断できるように出しておく。
         */
        jsonLdScript(buildWebPageSchema({
          url: canonicalUrl.value,
          name: nursery.value.name,
          siteUrl: site.url,
          dateModified: latestDataUpdate([nursery.value]),
        })),
      ]
    : [],
}))
</script>

<template>
  <main class="py-4">
    <template v-if="nursery">
      <AppBreadcrumb
        :items="[
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
            label: globalDistrict.name,
            icon: 'i-heroicons-clipboard-document-list',
            to: `/nurseries/${globalDistrict.alphabet}`,
          },
          {
            label: nursery.name,
            icon: 'i-heroicons-information-circle',
          },
        ]"
      />
      <UContainer>
        <UCard
          class="mb-6 w-full max-w-(--breakpoint-2xl) mx-auto border-0"
          :ui="{ root: 'ring-0 md:ring shadow-none md:shadow-md' }"
        >
          <template #header>
            <h1 class="text-3xl font-bold text-center mb-4">
              {{ nursery.name }}
            </h1>
            <div
              v-if="nursery.is_active === false"
              class="mb-4 rounded-md border border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/40"
            >
              <p class="text-sm font-bold text-amber-800 dark:text-amber-200">
                この施設は現在募集を行っていません
              </p>
              <p class="mt-1 text-sm text-amber-800 dark:text-amber-200">
                閉園または統廃合により、つくば市の最新の認可保育所等一覧に掲載されていません。
                掲載内容は{{ formatSourceDate(nursery.source_date) || '過去' }}時点の情報です。
              </p>
            </div>
            <!--
              地図はスマホでは高さを抑える (#129)。
              812px の画面で 480px 固定だと画面の59%を占め、開いた直後は地図しか見えず、
              園名・住所・定員といった判断に要る情報が最初の画面に入らなかった。

              以前は loading="lazy" を付けていたが、地図は h1 のすぐ下（スマホでも最初の
              画面の中）にあり、遅延で得るものが無い。それどころか読み込みがいつまでも
              始まらず、10秒以上まっさらなままになることがあった (#179)。
              埋め込み自体の応答は 0.6 秒ほどで、遅いのは読み込みの開始だった。
            -->
            <div class="relative w-full h-56 sm:h-80 lg:h-[30rem]">
              <!--
                読み込み中に出す文言。iframe は読み込みが終わるまで透けているので、
                下に敷いておけば地図が出た時点で隠れる。JS も状態も要らない。
                iframe 側に title があるので、読み上げには出さない。
              -->
              <p
                class="absolute inset-0 flex items-center justify-center text-sm text-muted"
                aria-hidden="true"
              >
                地図を読み込んでいます…
              </p>
              <!--
                q は施設名と住所。Google 側で場所を特定させるために渡すので、
                名前に & や # が入っても壊れないよう encodeURIComponent を通す。
              -->
              <iframe
                class="relative w-full h-full"
                frameborder="0"
                style="border:0"
                referrerpolicy="no-referrer-when-downgrade"
                :src="`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(`${nursery.name},${nursery.address}`)}&center=${nursery.latitude},${nursery.longitude}`"
                allowfullscreen
                :title="`${nursery.name}の地図`"
              />
            </div>
            <!--
              一覧の距離は直線距離で、大字を基準にした場合は大字の中心からの目安でしかない (#139)。
              道のりや所要時間を正確に知りたい人はここから Google マップへ送る。
              経路URLは api=1 の公式形式で、APIキーも課金も要らない。
            -->
            <p class="mt-2 text-sm">
              <ULink
                :to="`https://www.google.com/maps/dir/?api=1&destination=${nursery.latitude},${nursery.longitude}`"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 text-primary underline"
              >
                <UIcon
                  name="i-lucide-route"
                  class="size-4 shrink-0"
                  aria-hidden="true"
                />
                Googleマップで経路を調べる
              </ULink>
            </p>
          </template>

          <div class="w-full">
            <!--
              項目表はスマホでは1カラム（ラベルの下に値）に落とす (#129)。
              375px で2カラム固定にするとラベル列が156px（42%）を占め、
              値の側に余裕が無かった。

              sm 以上はラベル列の幅を固定する。1fr の等分だと、
              値が短い行でもラベルが画面の半分近くを取ってしまう。
            -->
            <dl class="flex flex-col">
              <div
                v-for="row in detailRows"
                :key="row.label"
                class="grid grid-cols-1 sm:grid-cols-[minmax(10rem,16rem)_1fr] rounded-sm border-b border-default"
              >
                <dt class="px-2.5 pt-2.5 pb-0 text-sm font-medium text-muted sm:p-2.5 sm:text-base xl:p-5">
                  {{ row.label }}
                </dt>
                <dd class="px-2.5 pt-0.5 pb-2.5 text-sm font-medium sm:p-2.5 sm:text-base xl:p-5">
                  <span :class="row.muted ? 'text-muted' : 'text-default'">
                    {{ row.value }}
                  </span>
                </dd>
              </div>
            </dl>
            <p class="mt-6 text-sm text-muted">
              掲載内容は<ULink
                to="/license"
                class="underline"
                active-class="text-primary"
                inactive-class="text-muted hover:text-default"
              >つくば市が公開しているオープンデータ</ULink>をもとにしています（{{ formatSourceDate(nursery.source_date) || '公開時点' }}時点）。
              定員・開所時間・送迎バス・一時預かりなどは変更される場合があります。
              <strong class="font-bold">最新の情報は各施設へ直接お問い合わせください。</strong>
            </p>
          </div>
        </UCard>
      </UContainer>
    </template>
    <ULink
      to="/nurseries"
      class="block text-right underline"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >認可保育所一覧へ</ULink>
  </main>
</template>
