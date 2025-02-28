<script setup lang="ts">
const route = useRoute()
const keyword = ref<string>(route.query.keyword as string || '')

const classificationFilter = ref('')
const keywordFilter = ref('')
const typeFilter = ref('')

const classificationOptions = [
  {
    name: 'すべての区分',
    value: '',
  },
  {
    name: '公立',
    value: '公立',
  },
  {
    name: '民間',
    value: '民間',
  },
]

const typeOptions = [
  {
    name: 'すべての種別',
    value: '',
  },
  {
    name: '保育所',
    value: '保育所',
  },
  {
    name: '認定こども園',
    value: '認定こども園',
  },
  {
    name: '小規模保育事業所',
    value: '小規模保育事業所',
  },
]
const { data: nurseries } = useNurseries(keyword.value)

const filteredNurseries = computed(() => {
  if (!nurseries.value) return []

  return nurseries.value.filter((nursery) => {
    const matchClassification = !classificationFilter.value || nursery.classification === classificationFilter.value
    const matchKeyword = !keywordFilter.value || nursery.name.includes(keywordFilter.value)
    const matchType = !typeFilter.value || nursery.type === typeFilter.value

    return matchClassification && matchKeyword && matchType
  })
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
]

useHead({
  title: '認可保育所一覧',
})
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :links="links"
    />
    <h2 class="text-3xl font-bold text-center mb-4">
      認可保育所一覧
    </h2>
    <section class="container">
      <h3 class="text-2xl font-bold text-center mb-4">
        フィルター
      </h3>
      <div class="flex flex-col md:flex-row md:justify-between">
        <UFormGroup
          label="名前でフィルター"
        >
          <UInput
            v-model="keywordFilter"
            variant="outline"
            placeholder="名前を入力してください"
          />
        </UFormGroup>
        <UFormGroup
          label="区分でフィルター"
          class="mt-4 md:mt-0"
        >
          <USelect
            v-model="classificationFilter"
            :options="classificationOptions"
            option-attribute="name"
          />
        </UFormGroup>
        <UFormGroup
          label="種別でフィルター"
          class="mt-4 md:mt-0"
        >
          <USelect
            v-model="typeFilter"
            :options="typeOptions"
            option-attribute="name"
          />
        </UFormGroup>
      </div>
    </section>
    <section>
      <UContainer
        class="py-6 w-full max-w-screen-2xl mx-auto md:grid md:grid-cols-4 md:gap-4"
      >
        <UCard
          v-for="(nursery) in filteredNurseries"
          :key="nursery.name"
          class="w-full mt-4 md:mt-0"
        >
          <template #header>
            <h4 class="text-lg font-semibold text-center">
              <ULink
                :to="`/nurseries/${nursery.district_alphabet}/${nursery.nursery_id}`"
                class="underline"
              >{{ nursery.name }}
              </ULink>
            </h4>
          </template>
          <p><strong>区分:</strong> {{ nursery.classification }}</p>
          <p><strong>種別:</strong> {{ nursery.type }}</p>
          <p><strong>住所:</strong> {{ nursery.city }}{{ nursery.address1 }}{{ nursery.address2 }}{{ nursery.address3 }}</p>
          <p><strong>保育年齢:</strong> {{ nursery.childcare_age }}</p>
          <p><strong>利用可能曜日:</strong> {{ nursery.available_day }}</p>
          <img
            src="~/assets/no_image.png"
            alt="保育所画像"
            class="mt-2 w-full h-1/2 rounded-lg "
          >
          <ULink
            :to="`/nurseries/${nursery.district_alphabet}/${nursery.nursery_id}`"
            class="block text-right underline"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            詳細へ
          </ULink>
        </UCard>
      </UContainer>
    </section>
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
