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

/**
 * 年齢セルと曜日ドットで共用する塗り分け。
 *
 * primary をベタ塗りにするとダークモードでビビッドピンクの面が広く出て目に痛く、
 * かつ #ff69b4 に白文字はコントラスト比が 2:1 程度しかない。
 * そのため面はトーンを落とし、文字を同系の濃い（ダークモードでは淡い）色にしている。
 */
const FILLED_CLASS = 'bg-kosodate-pink-100 text-kosodate-pink-900 dark:bg-kosodate-pink-950 dark:text-kosodate-pink-200 font-medium'
const EMPTY_CLASS = 'bg-elevated text-dimmed'
</script>

<template>
  <UCard
    class="w-full mt-4 md:mt-0 border-t-4"
    :class="accentClass"
    :ui="{ body: 'space-y-4' }"
  >
    <template #header>
      <div class="space-y-2">
        <h4 class="text-lg font-semibold text-center">
          <ULink
            :to="detailPath"
            class="underline"
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
        開所曜日
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
      <p
        v-if="nursery.available_day_note"
        class="text-xs text-muted mt-1"
      >
        {{ nursery.available_day_note }}
      </p>
    </div>

    <ULink
      :to="detailPath"
      class="block text-right underline"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >
      詳細へ
    </ULink>
  </UCard>
</template>
