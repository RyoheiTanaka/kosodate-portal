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

const { data: nursery } = useNursery(district, id)

const detailRows = computed(() => nursery.value ? buildNurseryDetailRows(nursery.value) : [])

useHead({
  title: nursery.value?.name,
})
</script>

<template>
  <main class="py-4">
    <template v-if="nursery">
      <UBreadcrumb
        class="container pb-4"
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
            <h2 class="text-3xl font-bold text-center mb-4">
              {{ nursery.name }}
            </h2>
            <div
              v-if="nursery.is_active === false"
              class="mb-4 rounded-md border border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/40"
            >
              <p class="text-sm font-bold text-amber-800 dark:text-amber-200">
                この施設は現在募集を行っていません
              </p>
              <p class="mt-1 text-sm text-amber-800 dark:text-amber-200">
                閉園または統廃合により、つくば市の最新の認可保育所等一覧に掲載されていません。
                掲載内容は{{ nursery.source_date || '過去' }}時点の情報です。
              </p>
            </div>
            <iframe
              class="w-full h-[30rem]"
              frameborder="0"
              style="border:0"
              referrerpolicy="no-referrer-when-downgrade"
              :src="`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${nursery.name},${nursery.address}&center=${nursery.latitude},${nursery.longitude}`"
              allowfullscreen
            />
          </template>

          <div class="w-full">
            <div class="flex flex-col">
              <div
                v-for="row in detailRows"
                :key="row.label"
                class="grid grid-cols-2 rounded-sm border-b border-stroke"
              >
                <div class="p-2.5 xl:p-5">
                  <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                    {{ row.label }}
                  </h3>
                </div>
                <div class="p-2.5 xl:p-5">
                  <p
                    class="text-sm font-medium xsm:text-base"
                    :class="row.muted ? 'text-gray-500' : 'text-black dark:text-gray-200'"
                  >
                    {{ row.value }}
                  </p>
                </div>
              </div>
            </div>
            <p class="mt-6 text-sm text-gray-500 dark:text-gray-400">
              掲載内容はつくば市が公開している情報をもとにしています（{{ nursery.source_date || '公開時点' }}時点）。
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
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >認可保育所一覧へ</ULink>
  </main>
</template>
