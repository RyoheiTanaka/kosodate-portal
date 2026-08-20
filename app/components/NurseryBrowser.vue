<script setup lang="ts">
import type { NurseryFilters } from '~/composables/useNurseryFilters'

/**
 * 絞り込みとカード一覧の組。一覧・エリア別・地区別の3ページで同じ形で使う。
 *
 * ## 大きい画面では2カラムにする (#166)
 *
 * 絞り込みを横いっぱいに敷くと、1280×720 で1枚目のカードが 578px の位置にあり、
 * ファーストビューにカードがほぼ入らなかった。横幅が余っているのに縦だけを
 * 消費している状態で、絞り込みを左に寄せればその分カードが上がる。
 *
 * 左カラムは sticky にする。スクロールして下のほうの園を見ているときに、
 * 条件を変えるためだけに一番上まで戻る必要が無くなる。
 * 画面が低いと絞り込み自体が入り切らないので、はみ出す分はカラム内で送る。
 *
 * 2カラムにするのは lg から。それより狭いと、左に 320px 取るとカードが1列になり、
 * 縦に伸びて元の木阿弥になる。
 */
defineProps<{
  filters: NurseryFilters
  /** NurseryFilterPanel の id 重複よけ。ページごとに変える */
  idPrefix?: string
  /** 絞り込み前の件数。「N件 / 全M件」の母数 */
  total?: number
}>()
</script>

<template>
  <!-- pb-6 は下に続く要約や導線との間。以前はカード一覧が自前で持っていた余白 -->
  <div class="container w-full max-w-(--breakpoint-2xl) mx-auto pb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
    <NurseryFilterPanel
      :filters="filters"
      :id-prefix="idPrefix"
      class="lg:sticky lg:top-20 lg:w-80 lg:shrink-0 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
    />
    <NurseryCardList
      class="min-w-0 flex-1"
      :nurseries="filters.sorted.value"
      :status="filters.status.value"
      :total="total"
    />
  </div>
</template>
