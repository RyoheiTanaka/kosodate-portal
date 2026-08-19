<script setup lang="ts">
/**
 * エリアへの導線カード。トップページとエリア一覧ページで共用する。
 *
 * 子育て中の親が見る前提なので、文字だけの一覧ではなくアイコンと色で
 * 拾い読みできる形にしている。アイコンと色は目印であって意味は持たせていないため、
 * 読み上げには出さない（`aria-hidden`）。
 */
const props = defineProps<{
  area: Area
  /** 件数。渡されたときだけ出す。取得前は undefined を渡して伏せる */
  count?: number
}>()

/*
 * Tailwind はクラス名を静的に走査するので、`bg-kosodate-${tone}-50` のような
 * 組み立て方をすると生成されるCSSから漏れる。tone ごとに完全なクラス名で持つ。
 *
 * カードの地は白のまま、色は枠線とアイコンの丸だけに乗せている。
 * 7枚が並ぶ場所なので、面を塗ると画面の大半が色で埋まって目が疲れる。
 */
const TONE_CLASS = {
  pink: {
    card: 'border-kosodate-main-100 hover:border-kosodate-main-300 dark:border-kosodate-main-900/70 dark:hover:border-kosodate-main-700',
    icon: 'bg-kosodate-main-50 text-kosodate-main-700 dark:bg-kosodate-main-950 dark:text-kosodate-main-200',
  },
  yellow: {
    card: 'border-kosodate-sub-200 hover:border-kosodate-sub-400 dark:border-kosodate-sub-900/70 dark:hover:border-kosodate-sub-700',
    icon: 'bg-kosodate-sub-100 text-kosodate-sub-900 dark:bg-kosodate-sub-950 dark:text-kosodate-sub-100',
  },
} as const

const tone = computed(() => TONE_CLASS[props.area.tone])
</script>

<template>
  <ULink
    :to="`/nurseries/area/${area.alphabet}`"
    class="group flex items-center gap-3 rounded-2xl border-2 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    :class="tone.card"
  >
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
      :class="tone.icon"
      aria-hidden="true"
    >
      <UIcon
        :name="area.icon"
        class="size-6"
      />
    </span>
    <span class="min-w-0 flex-1">
      <span class="flex items-baseline justify-between gap-2">
        <span class="font-bold text-default">{{ area.name }}</span>
        <span
          v-if="count !== undefined"
          class="shrink-0 text-sm text-muted tabular-nums"
        >{{ count }} 件</span>
      </span>
      <span class="mt-0.5 block text-sm text-muted">{{ area.description }}</span>
    </span>
  </ULink>
</template>
