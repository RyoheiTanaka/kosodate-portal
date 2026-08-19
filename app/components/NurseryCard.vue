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
  <UCard
    class="w-full border-t-4 relative transition-colors hover:bg-elevated/50 focus-within:ring-2 focus-within:ring-primary"
    :class="accentClass"
    :ui="{ body: 'space-y-4' }"
  >
    <template #header>
      <div class="space-y-2">
        <h4 class="text-lg font-semibold text-center">
          <ULink
            :to="detailPath"
            class="after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >{{ nursery.name }}</ULink>
        </h4>
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

    <p class="flex items-start gap-2 text-sm">
      <UIcon
        name="i-heroicons-map-pin"
        class="size-4 shrink-0 mt-0.5 text-primary"
      />
      <span>{{ nursery.address }}{{ nursery.address_note }}</span>
    </p>

    <!--
      受入年齢と開所曜日は、写真の代わりにカードへ視覚的な変化をつけると同時に
      「うちの子は入れるのか」「土曜はやっているのか」を読まずに分かるようにするための図。
      どちらもラベル付きのマス目で、塗り = 対応あり という同じ語彙に揃えている。
    -->
    <div>
      <p class="text-xs text-muted mb-1">
        受入年齢（歳）
      </p>
      <div
        v-if="ages"
        class="flex gap-1"
      >
        <span
          v-for="age in AGE_SCALE"
          :key="age"
          class="flex-1 h-7 rounded flex items-center justify-center text-xs tabular-nums"
          :class="ages.includes(age) ? FILLED_CLASS : EMPTY_CLASS"
        >{{ age }}</span>
      </div>
      <p class="text-xs text-muted mt-1">
        {{ nursery.childcare_age }}
      </p>
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
          class="size-7 shrink-0 rounded-full flex items-center justify-center text-xs"
          :class="days.includes(weekday) ? FILLED_CLASS : EMPTY_CLASS"
        >{{ weekday }}</span>
      </div>
      <p
        v-else
        class="text-sm"
      >
        {{ nursery.available_day }}
      </p>
      <dl
        v-if="weekdayHours || saturdayHours"
        class="mt-2 text-sm space-y-0.5"
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
