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
      ピンクは彩度が高いので、面ではなくアイコンの小さい丸だけに使う。
      文字色は 700 まで暗くしてコントラストを確保する（500 の #ff69b4 は白地に薄い）
    -->
    <span
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-kosodate-pink-50 text-kosodate-pink-700 dark:bg-kosodate-pink-950 dark:text-kosodate-pink-200"
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
      class="h-1 flex-1 rounded-full bg-kosodate-pink-100 dark:bg-kosodate-pink-900/60"
      aria-hidden="true"
    />
  </div>
</template>
