<script setup lang="ts">
import type { INursery } from '~~/server/types/nursery'

const props = defineProps<{
  nursery: INursery
}>()

const detailPath = computed(() =>
  `/nurseries/${props.nursery.district_alphabet}/${props.nursery.nursery_id}`,
)

/** 公立と民間でカード上端のアクセント色を変え、一覧の中で区分を見分けられるようにする */
const accentClass = computed(() =>
  props.nursery.classification === '公立' ? 'border-t-primary' : 'border-t-secondary',
)

/*
 * 距離は基準点があるときだけ出す (#87)。
 *
 * 基準点は props ではなく共有の状態から取る。props で配ると
 * NurseryCardList を経由して全カードに配ることになる。
 */
const { basePoint } = useNurseryBasePoint()

const distance = computed(() => {
  if (!basePoint.value) return null

  return formatDistance(distanceInKm(basePoint.value, props.nursery))
})

const ages = computed(() => parseChildcareAges(props.nursery.childcare_age))
const days = computed(() => parseAvailableDays(props.nursery.available_day))

/** `なし`（土曜の開所なし）や空欄のときは時間帯を組み立てない */
const formatHours = (open: string, close: string) =>
  open && close && open !== 'なし' && close !== 'なし' ? `${open}〜${close}` : null

const weekdayHours = computed(() => formatHours(props.nursery.open_weekday, props.nursery.close_weekday))
const saturdayHours = computed(() => formatHours(props.nursery.open_saturday, props.nursery.close_saturday))

/**
 * 年齢セルと曜日ドットで共用する塗り分け。
 *
 * primary の基準色をベタ塗りにすると、色の面が広く出て目に痛いうえ、
 * そこに白文字を乗せるとコントラストが足りない。
 * そのため面はトーンを落とし、文字を同系の濃い（ダークモードでは淡い）色にしている。
 */
const FILLED_CLASS = 'bg-kosodate-main-100 text-kosodate-main-900 dark:bg-kosodate-main-950 dark:text-kosodate-main-200 font-medium'
const EMPTY_CLASS = 'bg-elevated text-dimmed'
</script>

<template>
  <!--
    カード全体を詳細ページへのリンクにする。
    見出しのリンクに after で透明な面を敷いて広げているため、
    カード内に別のリンクを置くと重なって押せなくなる点に注意。
  -->
  <!--
    余白は既定より詰めている (#129)。1カラムのスマホではカード1枚の高さが
    そのまま一覧全体の長さになるため、枚数ぶん効いてくる。
  -->
  <UCard
    class="w-full border-t-4 relative transition-colors hover:bg-elevated/50 focus-within:ring-2 focus-within:ring-primary"
    :class="accentClass"
    :ui="{ header: 'p-4 sm:p-5', body: 'space-y-3 p-4 sm:p-5' }"
  >
    <template #header>
      <div class="space-y-1.5">
        <h3 class="text-lg font-semibold text-center">
          <ULink
            :to="detailPath"
            class="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >{{ nursery.name }}</ULink>
        </h3>
        <div class="flex justify-center gap-2">
          <UBadge
            :color="nursery.classification === '公立' ? 'primary' : 'secondary'"
            variant="subtle"
            size="sm"
          >
            {{ nursery.classification }}
          </UBadge>
          <UBadge
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ nursery.type }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-1.5">
      <p class="flex items-start gap-2 text-sm">
        <UIcon
          name="i-heroicons-map-pin"
          class="size-4 shrink-0 mt-0.5 text-primary"
        />
        <span>{{ nursery.address }}{{ nursery.address_note }}</span>
      </p>

      <!--
        定員・送迎バス・一時預かりは園を選ぶ判断に効くが、詳細ページを開かないと
        分からなかった (#108)。候補を絞る段階で見えるようにする。

        高さを増やさないよう1行にまとめている。バッジを縦に積むとカード1枚が伸び、
        1カラムのスマホでは一覧全体が一気に長くなる（#129）。

        送迎バスと一時預かりは true のときだけ出す。false まで出すとバッジが増えて
        カードが騒がしくなるうえ、大半が false なので情報量にならない。
        送迎バスの null は「無」ではなく「不明」なので、ここでは何も出さない。
        断定できない情報を一覧に出すより、詳細ページの
        「情報なし（施設へお問い合わせください）」に任せる。
      -->
      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <!-- 距離は基準点を選んでいるときだけ出る。直線距離である旨はツールバー側で断っている -->
        <span
          v-if="distance"
          class="flex items-center gap-1 font-bold text-primary"
        >
          <UIcon
            name="i-lucide-locate-fixed"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          {{ distance }}
        </span>
        <span
          v-if="nursery.capacity"
          class="flex items-center gap-1 text-muted"
        >
          <UIcon
            name="i-lucide-users"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          定員 <span class="tabular-nums text-default">{{ nursery.capacity }}</span> 人
        </span>
        <span
          v-if="nursery.shuttle_bus === true"
          class="flex items-center gap-1 text-toned"
        >
          <UIcon
            name="i-lucide-bus"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          送迎バス
        </span>
        <span
          v-if="nursery.is_temporary_care"
          class="flex items-center gap-1 text-toned"
        >
          <UIcon
            name="i-lucide-clock"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          一時預かり
        </span>
      </p>
    </div>

    <!--
      受入年齢と開所曜日は、写真の代わりにカードへ視覚的な変化をつけると同時に
      「うちの子は入れるのか」「土曜はやっているのか」を読まずに分かるようにするための図。
      どちらもラベル付きのマス目で、塗り = 対応あり という同じ語彙に揃えている。
    -->
    <div>
      <!-- 見出しと原文は同じ行に置く。原文は図で表せない表記（産休明けなど）のために残している -->
      <div class="flex items-baseline justify-between gap-2 mb-1 text-xs text-muted">
        <p class="shrink-0">
          受入年齢（歳）
        </p>
        <p class="truncate">
          {{ nursery.childcare_age }}
        </p>
      </div>
      <div
        v-if="ages"
        class="flex gap-1"
      >
        <span
          v-for="age in AGE_SCALE"
          :key="age"
          class="flex-1 h-6 rounded flex items-center justify-center text-xs tabular-nums"
          :class="ages.includes(age) ? FILLED_CLASS : EMPTY_CLASS"
        >{{ age }}</span>
      </div>
    </div>

    <div>
      <p class="text-xs text-muted mb-1">
        開所曜日・時間
      </p>
      <!-- 1カラム表示でも丸が間延びしないよう、曜日だけはサイズを固定する -->
      <div
        v-if="days"
        class="flex gap-1.5"
      >
        <span
          v-for="weekday in WEEKDAYS"
          :key="weekday"
          class="size-6 shrink-0 rounded-full flex items-center justify-center text-xs"
          :class="days.includes(weekday) ? FILLED_CLASS : EMPTY_CLASS"
        >{{ weekday }}</span>
      </div>
      <p
        v-else
        class="text-sm"
      >
        {{ nursery.available_day }}
      </p>
      <!-- 平日と土曜は横に並べる。縦に積むと1行ぶんカードが伸びる (#129) -->
      <dl
        v-if="weekdayHours || saturdayHours"
        class="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm"
      >
        <div
          v-if="weekdayHours"
          class="flex gap-2"
        >
          <dt class="text-muted shrink-0">
            平日
          </dt>
          <dd class="tabular-nums">
            {{ weekdayHours }}
          </dd>
        </div>
        <div
          v-if="saturdayHours"
          class="flex gap-2"
        >
          <dt class="text-muted shrink-0">
            土曜
          </dt>
          <dd class="tabular-nums">
            {{ saturdayHours }}
          </dd>
        </div>
      </dl>
      <p
        v-if="nursery.available_day_note"
        class="text-xs text-muted mt-1"
      >
        {{ nursery.available_day_note }}
      </p>
    </div>

    <!-- カード全体がリンクなので、ここは押せる場所を示すだけの装飾。入れ子のリンクにはしない -->
    <p
      class="text-right text-sm underline text-toned"
      aria-hidden="true"
    >
      詳細へ
    </p>
  </UCard>
</template>
