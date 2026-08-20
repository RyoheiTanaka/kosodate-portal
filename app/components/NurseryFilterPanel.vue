<script setup lang="ts">
import type { NurseryFilters } from '~/composables/useNurseryFilters'

/**
 * 絞り込みと並び替えのツールバー。一覧・エリア別・地区別の3ページで共用する (#134)。
 *
 * 状態は `useNurseryFilters` が持つ。このコンポーネントは表示だけを担当し、
 * どの条件を出すか（`visible`）も composable の判断に従う。
 *
 * 条件が8つあるので1行に並べず、役割ごとに段を分けている。
 * キーワード / 場所と属性のセレクト / 設備のトグルと並び替え の3段。
 *
 * ## スマホでは畳む (#145)
 *
 * 8つ全部を常に出すと 458px（375×812 の画面の56%）を占め、
 * ファーストビューにカードが1枚も入らなかった。
 * 常に出すのは「まず打つ」キーワードと「まず並べ替える」並び替えの2つだけにして、
 * 残りは「詳しく絞り込む」の中に畳む。
 * sm 以上は横に余裕があり畳む理由が無いので、従来どおり開いた状態にする。
 */
const props = defineProps<{
  filters: NurseryFilters
  /** セレクトの id が重複しないように前置きする。1ページに1つしか置かない想定だが念のため */
  idPrefix?: string
}>()

/*
 * setup で受け取り直す。
 *
 * テンプレートから `props.filters.state.x` を v-model すると
 * vue/no-mutating-props に引っかかる。実体は composable が所有する reactive で、
 * 親が差し替えることもないため、ここで取り出してしまってよい。
 */
const { state, visible, options, nurseries, hasActiveFilters, hiddenUnknownShuttleBusCount, reset } = props.filters

const sortId = computed(() => `${props.idPrefix ?? 'nursery'}-sort`)
const oazaId = computed(() => `${props.idPrefix ?? 'nursery'}-oaza`)
const advancedId = computed(() => `${props.idPrefix ?? 'nursery'}-advanced`)

/*
 * 畳んだ中で効いている条件の数 (#145)。
 *
 * 畳んでいると、件数が少ない理由が見えない。開かなくても分かるようにバッジで出す。
 * キーワードと並び替えは畳まないので数えない。
 */
const activeAdvancedCount = computed(() => [
  visible.area && state.area !== ALL,
  visible.district && state.district !== ALL,
  state.classification !== ALL,
  state.type !== ALL,
  state.bus,
  state.temporary,
].filter(Boolean).length)

/*
 * URLのクエリに条件が入った状態で開いた場合は、開いた状態で出す。
 * 条件が効いているのに畳まれていると、件数が少ない理由が見えない。
 *
 * 見るのは初期値だけ。開いた後に条件を消しても勝手には閉じない。
 * 消した直後に畳まれると、続けて条件を変えたい人の手が止まるため。
 */
const isAdvancedOpen = ref(activeAdvancedCount.value > 0)

/*
 * 距離順ソートの基準点 (#87)。
 *
 * 「近い順」を選んだときだけ位置情報を求める。ページを開いただけで許可を聞くと、
 * 何のために聞かれているのか分からないまま拒否されやすい。
 */
const { basePoint, geolocationStatus, buildOazaOptions, requestGeolocation, setOaza, clear } = useNurseryBasePoint()

const isDistanceSort = computed(() => state.sort === 'distance')

const oazaOptions = computed(() => buildOazaOptions(nurseries.value))

const selectedOaza = computed({
  get: () => (basePoint.value?.source === 'oaza' ? basePoint.value.label : ''),
  set: (value: string) => {
    const option = oazaOptions.value.find(o => o.value === value)
    if (option) setOaza(option)
  },
})

watch(isDistanceSort, (selected) => {
  // 既に基準点があるなら聞き直さない
  if (selected && !basePoint.value && geolocationStatus.value === 'idle') requestGeolocation()
})
</script>

<template>
  <!--
    フィルターは一覧を絞るための道具なので、主役であるカードより目立たせない。
    見出しは支援技術のために残しつつ、視覚的には控えめなツールバーとして扱う。
  -->
  <section class="container">
    <h3 class="sr-only">
      絞り込みと並び替え
    </h3>
    <div class="rounded-lg border border-default p-4 flex flex-col gap-4">
      <!-- トップページの「キーワード検索」と同じものなので、呼び方を揃えている (#106) -->
      <UFormField label="キーワード">
        <UInput
          v-model="state.keyword"
          variant="outline"
          icon="i-heroicons-magnifying-glass"
          placeholder="名前・ふりがな・住所"
          class="w-full"
        />
      </UFormField>

      <!--
        並び替えは畳まない (#145)。「まず並べ替える」もので、開く操作を挟むと遠くなる。

        並び替えは絞り込みではないので「条件をクリア」の対象に含めない。
        件数が変わるものではなく、消したい条件でもないため。
      -->
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div class="flex items-center gap-2">
          <label
            :for="sortId"
            class="text-sm text-muted shrink-0"
          >並び替え</label>
          <USelect
            :id="sortId"
            v-model="state.sort"
            :items="options.sortOptions"
            class="w-44"
          />
        </div>

        <!-- 畳むのはスマホだけ。sm 以上ではボタンごと消し、中身を常に開いた状態にする -->
        <UButton
          class="sm:hidden"
          color="neutral"
          variant="outline"
          :icon="isAdvancedOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-adjustments-horizontal'"
          :aria-expanded="isAdvancedOpen"
          :aria-controls="advancedId"
          @click="isAdvancedOpen = !isAdvancedOpen"
        >
          詳しく絞り込む
          <UBadge
            v-if="activeAdvancedCount > 0"
            color="primary"
            variant="solid"
            size="sm"
            class="tabular-nums"
          >
            {{ activeAdvancedCount }}
          </UBadge>
        </UButton>

        <!--
          「条件をクリア」も畳まない。畳んだ中の条件ごと消す操作なので、
          開かないと押せないのでは意味が無い。
        -->
        <UButton
          v-if="hasActiveFilters"
          class="ms-auto"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="reset()"
        >
          条件をクリア
        </UButton>
      </div>

      <!--
        畳む中身 (#145)。
        v-if ではなく CSS で隠す。SSR の HTML から条件そのものが消えると、
        JavaScript が動く前の画面や支援技術の全文読みから条件が失われるため。
      -->
      <div
        :id="advancedId"
        class="flex-col gap-4 sm:flex"
        :class="isAdvancedOpen ? 'flex' : 'hidden'"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <!-- エリア別・地区別ページでは、その軸はパスで決まっているのでセレクトを出さない -->
          <UFormField
            v-if="visible.area"
            label="エリア"
            class="sm:flex-1 sm:min-w-52"
          >
            <USelect
              v-model="state.area"
              :items="options.areaOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-if="visible.district"
            label="地区"
            class="sm:flex-1 sm:min-w-40"
          >
            <USelect
              v-model="state.district"
              :items="options.districtOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="区分"
            class="sm:flex-1 sm:min-w-36"
          >
            <USelect
              v-model="state.classification"
              :items="options.classificationOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="種別"
            class="sm:flex-1 sm:min-w-48"
          >
            <USelect
              v-model="state.type"
              :items="options.typeOptions"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <UCheckbox
            v-model="state.bus"
            label="送迎バスあり"
          />
          <UCheckbox
            v-model="state.temporary"
            label="一時預かりあり"
          />
        </div>
      </div>

      <!--
        距離順ソートの基準点のUI (#87)。
        位置情報を拒否されても行き止まりにしないよう、大字を選ぶ道を必ず残す。

        「近い順」を選んだときだけでなく、基準点がある限り出す。
        基準点があればカードに距離が出るので、並び替えを名前順に戻した後も
        「直線距離です」の但し書きが必要になるため。

        畳む中には入れない (#145)。何を基準に並んでいるかは並び順そのものの説明で、
        開かないと読めないのでは困る。
      -->
      <div
        v-if="isDistanceSort || basePoint"
        class="rounded-md bg-elevated/50 p-3 flex flex-col gap-2"
      >
        <p
          v-if="basePoint"
          class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          role="status"
        >
          <UIcon
            name="i-lucide-locate-fixed"
            class="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>
            <span class="font-bold">{{ basePoint.label }}</span>
            <template v-if="isDistanceSort"> からの直線距離で並べています</template>
            <template v-else> からの直線距離を表示しています</template>
          </span>
          <UButton
            color="neutral"
            variant="link"
            size="xs"
            class="p-0"
            @click="clear()"
          >
            基準を変える
          </UButton>
        </p>

        <template v-else>
          <p
            class="text-sm text-muted"
            role="status"
          >
            <template v-if="geolocationStatus === 'loading'">
              位置情報を取得しています…
            </template>
            <template v-else-if="geolocationStatus === 'denied'">
              位置情報が許可されなかったため、大字を選んでください。
            </template>
            <template v-else-if="geolocationStatus === 'unsupported'">
              このブラウザでは位置情報を使えないため、大字を選んでください。
            </template>
            <template v-else-if="geolocationStatus === 'error'">
              位置情報を取得できませんでした。大字を選んでください。
            </template>
            <template v-else>
              現在地を使うか、大字を選んでください。
            </template>
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              :loading="geolocationStatus === 'loading'"
              icon="i-lucide-locate-fixed"
              size="sm"
              @click="requestGeolocation()"
            >
              現在地を使う
            </UButton>
            <div class="flex items-center gap-2">
              <label
                :for="oazaId"
                class="text-sm text-muted shrink-0"
              >大字から選ぶ</label>
              <USelect
                :id="oazaId"
                v-model="selectedOaza"
                :items="oazaOptions"
                placeholder="選択してください"
                class="w-40"
              />
            </div>
          </div>
        </template>

        <p class="text-xs text-dimmed">
          直線距離です。道のりや所要時間とは異なります。位置情報はこのブラウザの中だけで使い、送信も保存もしません。
        </p>
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
</template>
