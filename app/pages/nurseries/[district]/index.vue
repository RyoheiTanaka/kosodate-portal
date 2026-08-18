<script setup lang="ts">
const route = useRoute()
const params = route.params as Partial<NurseryRouteParams>
const district = params.district ?? ''

const config = useRuntimeConfig()
const globalDistricts = config.public.globalDistricts as Array<District>
const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district) || { alphabet: '', name: '' }
const districtName = globalDistrict.name

const { data: districtnurseries, status } = useDistrictNurseries(district)

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
      :items="links"
    />
    <h2 class="text-3xl font-bold text-center mb-4">
      {{ districtName }}
    </h2>
    <NurseryCardList
      :nurseries="districtnurseries"
      :status="status"
    />
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
