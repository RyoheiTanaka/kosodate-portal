<script setup lang="ts">
import type { INursery } from '~~/server/types/nursery'

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
const globalDistricts = config.public.globalDistricts as Array<District>

// エリアは一覧の主導線 (#86)。区分・種別より前に置く
const areaOptions = [
  { label: 'すべてのエリア', value: ALL },
  ...globalAreas.map(area => ({ label: area.name, value: area.alphabet })),
]

/*
 * 地区は市の公式区分。主導線はエリアだが (#86)、市の資料や他のサイトは地区で書かれているため、
 * 地区で探したい人のために残す (#108)。
 *
 * 地区別ページ（/nurseries/[district]）と違い、ここでは他の条件と組み合わせられる。
 * 「谷田部と桜を見比べたい」のような、1地区に収まらない探し方は地区別ページではできない。
 *
 * 選択肢は runtimeConfig から作る。ここでハードコードすると増減のたびに2箇所直すことになる。
 */
const districtOptions = [
  { label: 'すべての地区', value: ALL },
  ...globalDistricts.map(district => ({ label: district.name, value: district.alphabet })),
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
 * 並び替え (#110)。
 *
 * 既定は名前順。以前は API が返した順（MongoDB の挿入順）で、nursery_id 順ですらなく、
 * 利用者から見て説明のつかない並びだった。既定を決めておかないと
 * 「同じ条件で開いたのに並びが違う」が起こりうる。
 *
 * 名前順のキーは name_kana。name の文字コード順は日本語だと直感に合わない
 * （漢字が読みではなくコード順に並ぶ）。119件すべてに値があり、
 * 純粋なカタカナであることを確認済み。
 *
 * #87 の距離順はここに選択肢を1つ足す形になる。距離の比較には現在地という
 * 外の状態が要るため、比較関数は静的な表ではなく computed で組み立てている。
 */
const SORT_DEFAULT = 'name'

const sortOptions = [
  { label: '名前順', value: 'name' },
  { label: '定員が多い順', value: 'capacity-desc' },
  { label: '定員が少ない順', value: 'capacity-asc' },
]

const byKana = (a: INursery, b: INursery) => (a.name_kana || a.name).localeCompare(b.name_kana || b.name, 'ja')

/** 同値のときは名前順に倒す。並びが実行のたびに変わらないようにするため */
const comparators = computed<Record<string, (a: INursery, b: INursery) => number>>(() => ({
  'name': byKana,
  'capacity-desc': (a, b) => (b.capacity ?? 0) - (a.capacity ?? 0) || byKana(a, b),
  'capacity-asc': (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0) || byKana(a, b),
}))

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
const districtValues = districtOptions.map(o => o.value)
const classificationValues = classificationOptions.map(o => o.value)
const typeValues = typeOptions.map(o => o.value)

/** 真偽の条件は URL では '1' のみを真として扱う。それ以外の文字列は無視する */
const readFlag = (key: string) => route.query[key] === '1'

const keywordFilter = ref(readQuery('keyword', ''))
const areaFilter = ref(readQuery('area', ALL, areaValues))
const districtFilter = ref(readQuery('district', ALL, districtValues))
const classificationFilter = ref(readQuery('classification', ALL, classificationValues))
const typeFilter = ref(readQuery('type', ALL, typeValues))
const shuttleBusFilter = ref(readFlag('bus'))
const temporaryCareFilter = ref(readFlag('temporary'))
const sortValues = sortOptions.map(o => o.value)
const sortOrder = ref(readQuery('sort', SORT_DEFAULT, sortValues))

/** 既定値の条件は URL に出さない。共有されたURLが読める長さに収まるようにする */
const toQuery = () => {
  const query: Record<string, string> = {}
  if (keywordFilter.value) query.keyword = keywordFilter.value
  if (areaFilter.value !== ALL) query.area = areaFilter.value
  if (districtFilter.value !== ALL) query.district = districtFilter.value
  if (classificationFilter.value !== ALL) query.classification = classificationFilter.value
  if (typeFilter.value !== ALL) query.type = typeFilter.value
  if (shuttleBusFilter.value) query.bus = '1'
  if (temporaryCareFilter.value) query.temporary = '1'
  if (sortOrder.value !== SORT_DEFAULT) query.sort = sortOrder.value
  return query
}

/*
 * 条件 -> URL と URL -> 条件 の双方向で同期する。
 * 同じ内容なら書き戻さない。2つの watch が互いを呼び合って往復するのを止めるため。
 */
const serialize = (query: Record<string, string | undefined>) =>
  Object.entries(query).filter(([, v]) => v).sort().map(([k, v]) => `${k}=${v}`).join('&')

watch([keywordFilter, areaFilter, districtFilter, classificationFilter, typeFilter, shuttleBusFilter, temporaryCareFilter, sortOrder], () => {
  const query = toQuery()
  if (serialize(query) === serialize(route.query as Record<string, string>)) return
  // push ではなく replace。1文字打つたびに履歴が積まれると「戻る」が使い物にならなくなる
  router.replace({ query })
})

watch(() => route.query, () => {
  keywordFilter.value = readQuery('keyword', '')
  areaFilter.value = readQuery('area', ALL, areaValues)
  districtFilter.value = readQuery('district', ALL, districtValues)
  classificationFilter.value = readQuery('classification', ALL, classificationValues)
  typeFilter.value = readQuery('type', ALL, typeValues)
  shuttleBusFilter.value = readFlag('bus')
  temporaryCareFilter.value = readFlag('temporary')
  sortOrder.value = readQuery('sort', SORT_DEFAULT, sortValues)
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
    const matchDistrict = districtFilter.value === ALL || nursery.district_alphabet === districtFilter.value
    // shuttle_bus の null は「不明」。=== true で見るので、不明の園は「あり」に含めない
    const matchShuttleBus = !shuttleBusFilter.value || nursery.shuttle_bus === true
    const matchTemporaryCare = !temporaryCareFilter.value || nursery.is_temporary_care === true

    return matchClassification && matchKeyword && matchType && matchArea
      && matchDistrict && matchShuttleBus && matchTemporaryCare
  })
})

/** sort は元の配列を書き換えるので、useFetch が持っているデータを壊さないよう複製してから並べる */
const sortedNurseries = computed(() => {
  const compare = comparators.value[sortOrder.value] ?? comparators.value[SORT_DEFAULT]!

  return [...filteredNurseries.value].sort(compare)
})

/*
 * 送迎バスで絞ったときに、情報が公開されていないために消えた園の数。
 *
 * shuttle_bus の null は「無」ではなく「不明」で、市が送迎バスの情報を
 * 公開していない公立保育所がこれに当たる（119件中15件、すべて公立）。
 * 黙って消すと「この条件では該当が少ない」と読まれてしまうため、件数を添えて断る。
 */
const hiddenUnknownShuttleBusCount = computed(() => {
  if (!shuttleBusFilter.value || !nurseries.value) return 0

  const keyword = keywordFilter.value.trim().toLowerCase()

  return nurseries.value.filter((nursery) => {
    if (nursery.shuttle_bus !== null && nursery.shuttle_bus !== undefined) return false

    // 送迎バス以外の条件は満たしているのに、送迎バスの条件だけで落ちた園を数える
    return (classificationFilter.value === ALL || nursery.classification === classificationFilter.value)
      && (!keyword || KEYWORD_FIELDS.some(field => (nursery[field] ?? '').toLowerCase().includes(keyword)))
      && (typeFilter.value === ALL || nursery.type === typeFilter.value)
      && (areaFilter.value === ALL || nursery.area_alphabet === areaFilter.value)
      && (districtFilter.value === ALL || nursery.district_alphabet === districtFilter.value)
      && (!temporaryCareFilter.value || nursery.is_temporary_care === true)
  }).length
})

/** 1つでも絞り込みが効いていればリセットを出す */
const hasActiveFilters = computed(() =>
  keywordFilter.value !== ''
  || classificationFilter.value !== ALL
  || typeFilter.value !== ALL
  || areaFilter.value !== ALL
  || districtFilter.value !== ALL
  || shuttleBusFilter.value
  || temporaryCareFilter.value,
)

const resetFilters = () => {
  keywordFilter.value = ''
  classificationFilter.value = ALL
  typeFilter.value = ALL
  areaFilter.value = ALL
  districtFilter.value = ALL
  shuttleBusFilter.value = false
  temporaryCareFilter.value = false
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
        絞り込みと並び替え
      </h3>
      <!--
        条件が7つに増えたので (#108)、1行に並べるのをやめて役割ごとに段を分けている。
        キーワード / 場所と属性のセレクト / 設備のトグル の3段。
      -->
      <div class="rounded-lg border border-default p-4 flex flex-col gap-4">
        <!--
          トップページの「キーワード検索」と同じものなので、呼び方を揃えている (#106)。
          以前はここだけ「名前」で、対象も name のみだった。
        -->
        <UFormField label="キーワード">
          <UInput
            v-model="keywordFilter"
            variant="outline"
            icon="i-heroicons-magnifying-glass"
            placeholder="名前・ふりがな・住所"
            class="w-full"
          />
        </UFormField>

        <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <UFormField
            label="エリア"
            class="sm:flex-1 sm:min-w-52"
          >
            <USelect
              v-model="areaFilter"
              :items="areaOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="地区"
            class="sm:flex-1 sm:min-w-40"
          >
            <USelect
              v-model="districtFilter"
              :items="districtOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="区分"
            class="sm:flex-1 sm:min-w-36"
          >
            <USelect
              v-model="classificationFilter"
              :items="classificationOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="種別"
            class="sm:flex-1 sm:min-w-48"
          >
            <USelect
              v-model="typeFilter"
              :items="typeOptions"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <UCheckbox
            v-model="shuttleBusFilter"
            label="送迎バスあり"
          />
          <UCheckbox
            v-model="temporaryCareFilter"
            label="一時預かりあり"
          />
          <!--
            並び替えは絞り込みではないので「条件をクリア」の対象に含めない。
            件数が変わるものではなく、消したい条件でもないため。
          -->
          <div class="flex items-center gap-2 ms-auto">
            <label
              for="nursery-sort"
              class="text-sm text-muted shrink-0"
            >並び替え</label>
            <USelect
              id="nursery-sort"
              v-model="sortOrder"
              :items="sortOptions"
              class="w-44"
            />
          </div>
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

        <!--
          送迎バスの情報が公開されていない園（すべて公立）は「あり」で絞ると消える。
          データが未公開なだけで、送迎バスが無いと確定したわけではないので断っておく (#108)。
        -->
        <p
          v-if="hiddenUnknownShuttleBusCount > 0"
          class="flex items-start gap-2 text-sm text-muted"
          role="status"
        >
          <UIcon
            name="i-heroicons-information-circle"
            class="size-4 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>
            送迎バスの情報が公開されていない
            <span class="tabular-nums">{{ hiddenUnknownShuttleBusCount }}</span> 件（公立保育所）は結果に含まれていません。
            送迎バスが無いと確定したわけではないため、各施設へお問い合わせください。
          </span>
        </p>
      </div>
    </section>
    <section>
      <NurseryCardList
        :nurseries="sortedNurseries"
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
