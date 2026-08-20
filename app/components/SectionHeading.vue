<script setup lang="ts">
/**
 * 見出しにアイコンと下線の飾りを付ける。
 *
 * トップページの「キーワード検索」「エリアから探す」「地区から探す」のように、
 * 同じ階層の見出しが続く場所で使う。飾りが揃っていることで、
 * どれが同じ粒度の項目なのかが読まずに分かる。
 *
 * `level` は見た目ではなく文書構造のためのもの。飾りの見た目は変わらない。
 */
withDefaults(defineProps<{
  title: string
  icon: string
  level?: 'h2' | 'h3'
}>(), {
  level: 'h3',
})
</script>

<template>
  <div class="mb-3 flex items-center gap-2">
    <!--
      色は面ではなくアイコンの小さい丸だけに使う。
      文字色は 700 まで暗くしてコントラストを確保する（500 は白地では薄い）
    -->
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-kosodate-main-50 text-kosodate-main-700 dark:bg-kosodate-main-950 dark:text-kosodate-main-200"
      aria-hidden="true"
    >
      <UIcon
        :name="icon"
        class="size-5"
      />
    </span>
    <component
      :is="level"
      class="text-lg font-bold sm:text-xl"
    >
      {{ title }}
    </component>
    <!-- 見出しの右を余らせずに埋める飾り。意味は持たない -->
    <span
      class="h-1 flex-1 rounded-full bg-kosodate-main-100 dark:bg-kosodate-main-900/60"
      aria-hidden="true"
    />
  </div>
</template>
