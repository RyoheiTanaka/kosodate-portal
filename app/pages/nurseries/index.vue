<script setup lang="ts">
const route = useRoute()
const router = useRouter()

/**
 * 「すべて」を表す番兵。
 * reka-ui の SelectItem は空文字の value を許さない（空文字は選択解除の意味を持つ）ため、
 * v3 のように value: '' の選択肢を置けない。
 */
const ALL = 'all'

const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>

// エリアは一覧の主導線 (#86)。区分・種別より前に置く
const areaOptions = [
  { label: 'すべてのエリア', value: ALL },
  ...globalAreas.map(area => ({ label: area.name, value: area.alphabet })),
]

// USelect の既定の labelKey は label なので、v3 の name から付け替えている
const classificationOptions = [
  {
    label: 'すべての区分',
    value: ALL,
  },
  {
    label: '公立',
    value: '公立',
  },
  {
    label: '民間',
    value: '民間',
  },
]

const typeOptions = [
  {
    label: 'すべての種別',
    value: ALL,
  },
  {
    label: '保育所',
    value: '保育所',
  },
  {
    label: '認定こども園',
    value: '認定こども園',
  },
  {
    label: '小規模保育事業所',
    value: '小規模保育事業所',
  },
]
/*
 * 絞り込みの状態は URL クエリを正とする (#106)。
 *
 * 以前は URL の `?keyword=`（サーバー検索）と入力欄（name への Array.filter）が
 * 別々の機構に繋がっていて同期しておらず、トップから検索して遷移すると
 * 入力欄が空のまま結果だけ絞られている状態になっていた。
 *
 * 選択肢に無い値が URL に入っていた場合は「すべて」に倒す。
 * USelect に未知の値を渡すと、選択中の表示が空欄になって何が起きているか分からなくなるため。
 */
const readQuery = (key: string, fallback: string, allowed?: string[]) => {
  const raw = route.query[key]
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return fallback
  if (allowed && !allowed.includes(value)) return fallback
  return value
}

const areaValues = areaOptions.map(o => o.value)
const classificationValues = classificationOptions.map(o => o.value)
const typeValues = typeOptions.map(o => o.value)

const keywordFilter = ref(readQuery('keyword', ''))
const areaFilter = ref(readQuery('area', ALL, areaValues))
const classificationFilter = ref(readQuery('classification', ALL, classificationValues))
const typeFilter = ref(readQuery('type', ALL, typeValues))

/** 既定値の条件は URL に出さない。共有されたURLが読める長さに収まるようにする */
const toQuery = () => {
  const query: Record<string, string> = {}
  if (keywordFilter.value) query.keyword = keywordFilter.value
  if (areaFilter.value !== ALL) query.area = areaFilter.value
  if (classificationFilter.value !== ALL) query.classification = classificationFilter.value
  if (typeFilter.value !== ALL) query.type = typeFilter.value
  return query
}

/*
 * 条件 -> URL と URL -> 条件 の双方向で同期する。
 * 同じ内容なら書き戻さない。2つの watch が互いを呼び合って往復するのを止めるため。
 */
const serialize = (query: Record<string, string | undefined>) =>
  Object.entries(query).filter(([, v]) => v).sort().map(([k, v]) => `${k}=${v}`).join('&')

watch([keywordFilter, areaFilter, classificationFilter, typeFilter], () => {
  const query = toQuery()
  if (serialize(query) === serialize(route.query as Record<string, string>)) return
  // push ではなく replace。1文字打つたびに履歴が積まれると「戻る」が使い物にならなくなる
  router.replace({ query })
})

watch(() => route.query, () => {
  keywordFilter.value = readQuery('keyword', '')
  areaFilter.value = readQuery('area', ALL, areaValues)
  classificationFilter.value = readQuery('classification', ALL, classificationValues)
  typeFilter.value = readQuery('type', ALL, typeValues)
})

/*
 * 読み込み時に URL を実際の状態へ揃える。
 *
 * 上の watch は「値が変わったとき」しか動かないので、選択肢に無い値
 * （例: ?area=ZZZ）で来た場合は、条件は「すべて」に倒れているのに URL には
 * ZZZ が残ったままになる。表示と URL が食い違うと、共有された側が混乱する。
 *
 * クライアントでのみ実行する。SSR 中にリダイレクトすると、
 * 単なる表記揺れの正規化のために余計な往復が増えるため。
 */
onMounted(() => {
  const query = toQuery()
  if (serialize(query) === serialize(route.query as Record<string, string>)) return
  router.replace({ query })
})

const { data: nurseries, status } = useNurseries()

/*
 * キーワードの対象は、以前サーバー検索が見ていた4フィールドに揃えている。
 * 以前は入力欄だけ name しか見ておらず、トップページで住所を入れると当たるのに
 * 同じ語を一覧の入力欄に打つと 0 件になる、という食い違いがあった。
 */
const KEYWORD_FIELDS = ['name', 'name_kana', 'address', 'childcare_age'] as const

const filteredNurseries = computed(() => {
  if (!nurseries.value) return []

  const keyword = keywordFilter.value.trim().toLowerCase()

  return nurseries.value.filter((nursery) => {
    const matchClassification = classificationFilter.value === ALL || nursery.classification === classificationFilter.value
    const matchKeyword = !keyword || KEYWORD_FIELDS.some(field => (nursery[field] ?? '').toLowerCase().includes(keyword))
    const matchType = typeFilter.value === ALL || nursery.type === typeFilter.value
    const matchArea = areaFilter.value === ALL || nursery.area_alphabet === areaFilter.value

    return matchClassification && matchKeyword && matchType && matchArea
  })
})

/** 1つでも絞り込みが効いていればリセットを出す */
const hasActiveFilters = computed(() =>
  keywordFilter.value !== ''
  || classificationFilter.value !== ALL
  || typeFilter.value !== ALL
  || areaFilter.value !== ALL,
)

const resetFilters = () => {
  keywordFilter.value = ''
  classificationFilter.value = ALL
  typeFilter.value = ALL
  areaFilter.value = ALL
}

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
      :items="links"
    />
    <h2 class="text-3xl font-bold text-center mb-4">
      認可保育所一覧
    </h2>
    <!--
      エリアは一覧の主導線 (#86)。
      下のフィルターがこの画面を絞るのに対し、こちらはエリア別ページへの入口で、
      URLを共有できる・検索エンジンに拾われるという別の役割を持つ。
    -->
    <section class="container mb-4">
      <h3 class="text-sm font-medium text-muted mb-2">
        <ULink
          to="/nurseries/area"
          class="underline underline-offset-2 hover:text-default"
        >エリアから探す</ULink>
      </h3>
      <nav
        class="flex flex-wrap gap-2"
        aria-label="エリア"
      >
        <UButton
          v-for="area in globalAreas"
          :key="area.alphabet"
          :to="`/nurseries/area/${area.alphabet}`"
          color="neutral"
          variant="outline"
          size="sm"
        >
          {{ area.name }}
        </UButton>
      </nav>
    </section>
    <!--
      フィルターは一覧を絞るための道具なので、主役であるカードより目立たせない。
      見出しは支援技術のために残しつつ、視覚的には控えめなツールバーとして扱う。
    -->
    <section class="container">
      <h3 class="sr-only">
        絞り込み
      </h3>
      <div class="rounded-lg border border-default p-4 flex flex-col gap-4 md:flex-row md:items-end">
        <!--
          トップページの「キーワード検索」と同じものなので、呼び方を揃えている (#106)。
          以前はここだけ「名前」で、対象も name のみだった。
        -->
        <UFormField
          label="キーワード"
          class="md:flex-1"
        >
          <UInput
            v-model="keywordFilter"
            variant="outline"
            icon="i-heroicons-magnifying-glass"
            placeholder="名前・ふりがな・住所"
            class="w-full"
          />
        </UFormField>
        <UFormField label="エリア">
          <USelect
            v-model="areaFilter"
            :items="areaOptions"
            class="w-full md:w-56"
          />
        </UFormField>
        <UFormField label="区分">
          <USelect
            v-model="classificationFilter"
            :items="classificationOptions"
            class="w-full md:w-44"
          />
        </UFormField>
        <UFormField label="種別">
          <USelect
            v-model="typeFilter"
            :items="typeOptions"
            class="w-full md:w-52"
          />
        </UFormField>
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="resetFilters"
        >
          条件をクリア
        </UButton>
      </div>
    </section>
    <section>
      <NurseryCardList
        :nurseries="filteredNurseries"
        :status="status"
        :total="nurseries?.length"
      />
    </section>
    <UContainer class="text-right">
      <ULink
        to="/"
        class="underline"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >トップページへ</ULink>
    </UContainer>
  </main>
</template>
