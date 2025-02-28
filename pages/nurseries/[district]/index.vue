<script setup lang="ts">
import type { District } from '~/types/global'
import type { NurseryRouteParams } from '~/types/route'

const route = useRoute()
const params = route.params as Partial<NurseryRouteParams>
const district = params.district ?? ''

const config = useRuntimeConfig()
const globalDistricts = config.public.globalDistricts as Array<District>
const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district) || { alphabet: '', name: '' }
const districtName = globalDistrict.name

const { data: districtnurseries } = useDistrictNurseries(district)

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
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :links="links"
    />
    <h2 class="text-3xl font-bold text-center mb-4">
      {{ districtName }}
    </h2>
    <UContainer
      class="py-6 w-full max-w-screen-2xl mx-auto md:grid md:grid-cols-4 md:gap-4"
    >
      <UCard
        v-for="(districtnursery) in districtnurseries"
        :key="districtnursery.name"
        class="w-full mt-4 md:mt-0"
      >
        <template #header>
          <h4 class="text-lg font-semibold text-center">
            <ULink
              :to="`/nurseries/${districtnursery.district_alphabet}/${districtnursery._id}`"
              class="underline"
            >{{ districtnursery.name }}
            </ULink>
          </h4>
        </template>
        <p><strong>区分:</strong> {{ districtnursery.classification }}</p>
        <p><strong>種別:</strong> {{ districtnursery.type }}</p>
        <p><strong>住所:</strong> {{ districtnursery.city }}{{ districtnursery.address1 }}{{ districtnursery.address2 }}{{ districtnursery.address3 }}</p>
        <p><strong>保育年齢:</strong> {{ districtnursery.childcare_age }}</p>
        <p><strong>利用可能曜日:</strong> {{ districtnursery.available_day }}</p>
        <img
          src="~/assets/no_image.png"
          alt="保育所画像"
          class="mt-2 w-full h-1/2 rounded-lg "
        >
        <ULink
          :to="`/nurseries/${districtnursery.district_alphabet}/${districtnursery._id}`"
          class="block text-right underline"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          詳細へ
        </ULink>
      </UCard>
    </UContainer>
    <div class="text-right">
      <ULink
        to="/"
        class="underline"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >トップページへ</ULink>
    </div>
  </main>
</template>
