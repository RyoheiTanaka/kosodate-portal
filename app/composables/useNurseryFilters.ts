import type { INursery } from '~~/server/types/nursery'

/**
 * 認可保育所の絞り込みと並び替え。一覧・エリア別・地区別の3ページで共用する (#134)。
 *
 * 元は `/nurseries` のページコンポーネントに直接書いていたが、エリア別・地区別ページに
 * 同じものを載せるにあたって切り出した。3箇所に写すと、条件を1つ足すたびに3箇所直すことになる。
 *
 * ## 軸の固定
 *
 * エリア別・地区別ページでは、その軸がURLのパスで決まっている。
 * `fixed` に渡すとその条件は常に効いた状態になり、セレクトも出さず、クエリにも書かない。
 * `/nurseries/area/banpaku?area=midorino` のような、パスとクエリが矛盾するURLを作らせない。
 *
 * ## 状態はURLクエリを正とする (#106)
 *
 * 既定値の条件はクエリに出さない。選択肢に無い値は既定に倒し、読み込み時にURL側も揃える。
 */

/**
 * 「すべて」を表す番兵。
 * reka-ui の SelectItem は空文字の value を許さない（空文字は選択解除の意味を持つ）ため、
 * v3 のように value: '' の選択肢を置けない。
 */
export const ALL = 'all'

/** 並び替えの既定。API が返す順（MongoDB の挿入順）は利用者から見て説明がつかない (#110) */
const SORT_DEFAULT = 'name'

/** 軸を固定するページで、どの条件がパス側で決まっているかを渡す */
export interface NurseryFilterFixed {
  area?: string
  district?: string
}

export const useNurseryFilters = (fixed: NurseryFilterFixed = {}) => {
  const route = useRoute()
  const router = useRouter()

  const config = useRuntimeConfig()
  const globalAreas = config.public.globalAreas as Array<Area>
  const globalDistricts = config.public.globalDistricts as Array<District>

  // 選択肢は runtimeConfig から作る。ここでハードコードすると増減のたびに2箇所直すことになる
  const areaOptions = [
    { label: 'すべてのエリア', value: ALL },
    ...globalAreas.map(area => ({ label: area.name, value: area.alphabet })),
  ]

  const districtOptions = [
    { label: 'すべての地区', value: ALL },
    ...globalDistricts.map(district => ({ label: district.name, value: district.alphabet })),
  ]

  // USelect の既定の labelKey は label なので、v3 の name から付け替えている
  const classificationOptions = [
    { label: 'すべての区分', value: ALL },
    { label: '公立', value: '公立' },
    { label: '民間', value: '民間' },
  ]

  const typeOptions = [
    { label: 'すべての種別', value: ALL },
    { label: '保育所', value: '保育所' },
    { label: '認定こども園', value: '認定こども園' },
    { label: '小規模保育事業所', value: '小規模保育事業所' },
  ]

  const { basePoint } = useNurseryBasePoint()

  const sortOptions = [
    { label: '名前順', value: 'name' },
    { label: '近い順', value: 'distance' },
    { label: '定員が多い順', value: 'capacity-desc' },
    { label: '定員が少ない順', value: 'capacity-asc' },
  ]

  /*
   * 名前順のキーは name_kana。name の文字コード順は日本語だと直感に合わない
   * （漢字が読みではなくコード順に並ぶ）。119件すべてに値があり、純粋なカタカナ。
   *
   * #87 の距離順はここに1つ足す形になる。距離の比較には現在地という外の状態が要るため、
   * 静的な表ではなく computed で組み立てている。
   */
  const byKana = (a: INursery, b: INursery) => (a.name_kana || a.name).localeCompare(b.name_kana || b.name, 'ja')

  /** 同値のときは名前順に倒す。並びが実行のたびに変わらないようにするため */
  const comparators = computed<Record<string, (a: INursery, b: INursery) => number>>(() => {
    const from = basePoint.value

    return {
      'name': byKana,
      'capacity-desc': (a, b) => (b.capacity ?? 0) - (a.capacity ?? 0) || byKana(a, b),
      'capacity-asc': (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0) || byKana(a, b),
      /*
       * 基準点が無いあいだは名前順のまま。並び替えで「近い順」を選んだ直後は
       * まだ位置情報の許可を聞いている最中で、基準点が入るのはその後になる。
       * ここで 0 を返して順序を不定にすると、許可した瞬間に並びが飛ぶ。
       */
      'distance': (a, b) => {
        if (!from) return byKana(a, b)

        return distanceInKm(from, a) - distanceInKm(from, b) || byKana(a, b)
      },
    }
  })

  /** 選択肢に無い値が URL に入っていたら既定に倒す。USelect に未知の値を渡すと表示が空欄になる */
  const readQuery = (key: string, fallback: string, allowed?: string[]) => {
    const raw = route.query[key]
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) return fallback
    if (allowed && !allowed.includes(value)) return fallback
    return value
  }

  /** 真偽の条件は URL では '1' のみを真として扱う。それ以外の文字列は無視する */
  const readFlag = (key: string) => route.query[key] === '1'

  const areaValues = areaOptions.map(o => o.value)
  const districtValues = districtOptions.map(o => o.value)
  const classificationValues = classificationOptions.map(o => o.value)
  const typeValues = typeOptions.map(o => o.value)
  const sortValues = sortOptions.map(o => o.value)

  const state = reactive({
    keyword: readQuery('keyword', ''),
    area: fixed.area ?? readQuery('area', ALL, areaValues),
    district: fixed.district ?? readQuery('district', ALL, districtValues),
    classification: readQuery('classification', ALL, classificationValues),
    type: readQuery('type', ALL, typeValues),
    bus: readFlag('bus'),
    temporary: readFlag('temporary'),
    sort: readQuery('sort', SORT_DEFAULT, sortValues),
  })

  /** パスで決まっている軸はセレクトを出さない。出すと同じことを2箇所で指定できてしまう */
  const visible = {
    area: fixed.area === undefined,
    district: fixed.district === undefined,
  }

  /** 既定値の条件と、パスで決まっている軸は URL に出さない */
  const toQuery = () => {
    const query: Record<string, string> = {}
    if (state.keyword) query.keyword = state.keyword
    if (visible.area && state.area !== ALL) query.area = state.area
    if (visible.district && state.district !== ALL) query.district = state.district
    if (state.classification !== ALL) query.classification = state.classification
    if (state.type !== ALL) query.type = state.type
    if (state.bus) query.bus = '1'
    if (state.temporary) query.temporary = '1'
    if (state.sort !== SORT_DEFAULT) query.sort = state.sort
    return query
  }

  /*
   * 条件 -> URL と URL -> 条件 の双方向で同期する。
   * 同じ内容なら書き戻さない。2つの watch が互いを呼び合って往復するのを止めるため。
   */
  const serialize = (query: Record<string, string | undefined>) =>
    Object.entries(query).filter(([, v]) => v).sort().map(([k, v]) => `${k}=${v}`).join('&')

  watch(state, () => {
    const query = toQuery()
    if (serialize(query) === serialize(route.query as Record<string, string>)) return
    // push ではなく replace。1文字打つたびに履歴が積まれると「戻る」が使い物にならなくなる
    router.replace({ query })
  })

  watch(() => route.query, () => {
    state.keyword = readQuery('keyword', '')
    if (visible.area) state.area = readQuery('area', ALL, areaValues)
    if (visible.district) state.district = readQuery('district', ALL, districtValues)
    state.classification = readQuery('classification', ALL, classificationValues)
    state.type = readQuery('type', ALL, typeValues)
    state.bus = readFlag('bus')
    state.temporary = readFlag('temporary')
    state.sort = readQuery('sort', SORT_DEFAULT, sortValues)
  })

  /*
   * 読み込み時に URL を実際の状態へ揃える。
   *
   * 上の watch は「値が変わったとき」しか動かないので、選択肢に無い値（例: ?area=ZZZ）で
   * 来た場合は、条件は既定に倒れているのに URL には ZZZ が残ったままになる。
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
   * キーワードの対象は、以前サーバー検索が見ていた4フィールドに揃えている (#106)。
   * 以前は入力欄だけ name しか見ておらず、トップページで住所を入れると当たるのに
   * 同じ語を一覧の入力欄に打つと 0 件になる、という食い違いがあった。
   */
  const KEYWORD_FIELDS = ['name', 'name_kana', 'address', 'childcare_age'] as const

  const matches = (nursery: INursery, keyword: string, ignore?: 'bus') => {
    const matchBus = ignore === 'bus' || !state.bus || nursery.shuttle_bus === true

    return (state.classification === ALL || nursery.classification === state.classification)
      && (!keyword || KEYWORD_FIELDS.some(field => (nursery[field] ?? '').toLowerCase().includes(keyword)))
      && (state.type === ALL || nursery.type === state.type)
      && (state.area === ALL || nursery.area_alphabet === state.area)
      && (state.district === ALL || nursery.district_alphabet === state.district)
      && matchBus
      && (!state.temporary || nursery.is_temporary_care === true)
  }

  const filtered = computed(() => {
    if (!nurseries.value) return []

    const keyword = state.keyword.trim().toLowerCase()

    return nurseries.value.filter(nursery => matches(nursery, keyword))
  })

  /** sort は元の配列を書き換えるので、useFetch が持っているデータを壊さないよう複製してから並べる */
  const sorted = computed(() => {
    const compare = comparators.value[state.sort] ?? comparators.value[SORT_DEFAULT]!

    return [...filtered.value].sort(compare)
  })

  /*
   * 送迎バスで絞ったときに、情報が公開されていないために消えた園の数 (#108)。
   *
   * shuttle_bus の null は「無」ではなく「不明」で、市が情報を公開していない公立保育所が
   * これに当たる（119件中15件、すべて公立）。黙って消すと「この条件では該当が少ない」と
   * 読まれてしまうため、件数を添えて断る。
   */
  const hiddenUnknownShuttleBusCount = computed(() => {
    if (!state.bus || !nurseries.value) return 0

    const keyword = state.keyword.trim().toLowerCase()

    return nurseries.value.filter((nursery) => {
      if (nursery.shuttle_bus !== null && nursery.shuttle_bus !== undefined) return false

      // 送迎バス以外の条件は満たしているのに、送迎バスの条件だけで落ちた園を数える
      return matches(nursery, keyword, 'bus')
    }).length
  })

  /*
   * 1つでも絞り込みが効いていればリセットを出す。
   * パスで決まっている軸は「消せない条件」なので数えない。
   * 並び替えは絞り込みではないので含めない（件数が変わるものではなく、消したい条件でもない）。
   */
  const hasActiveFilters = computed(() =>
    state.keyword !== ''
    || state.classification !== ALL
    || state.type !== ALL
    || (visible.area && state.area !== ALL)
    || (visible.district && state.district !== ALL)
    || state.bus
    || state.temporary,
  )

  const reset = () => {
    state.keyword = ''
    state.classification = ALL
    state.type = ALL
    if (visible.area) state.area = ALL
    if (visible.district) state.district = ALL
    state.bus = false
    state.temporary = false
  }

  return {
    state,
    visible,
    options: { areaOptions, districtOptions, classificationOptions, typeOptions, sortOptions },
    nurseries,
    status,
    filtered,
    sorted,
    hasActiveFilters,
    hiddenUnknownShuttleBusCount,
    reset,
  }
}

export type NurseryFilters = ReturnType<typeof useNurseryFilters>
