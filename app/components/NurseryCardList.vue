<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import type { INursery } from '~~/server/types/nursery'

const props = defineProps<{
  /** useFetch の data をそのまま渡せるよう undefined も受ける（取得前は undefined になる） */
  nurseries: INursery[] | null | undefined
  /** useFetch の status。読み込み中と 0 件を見分けるために受け取る */
  status: AsyncDataRequestStatus
  /** 絞り込み前の件数。渡されたときだけ「N件 / 全M件」の形で出す */
  total?: number
}>()

const count = computed(() => props.nurseries?.length ?? 0)

/** 絞り込みで件数が減っているときだけ母数を添える */
const showsTotal = computed(() => props.total !== undefined && props.total !== count.value)

/*
 * 一度に描画する件数 (#129)。
 *
 * 全119件を一度に描くと、375px幅の1カラムでページが64画面分になり、
 * 下のほうの園までスクロールで到達できないに近い状態だった。
 *
 * ページネーションではなく「もっと見る」にしている。ページを分けると
 * 「何ページ目にいるか」を利用者が管理することになるうえ、URLに状態が増える
 * （絞り込みは既にクエリを使っている #106）。追加読み込みなら位置を見失わない。
 *
 * 24件は 1カラムで約8画面分、4カラム（xl）でちょうど6行。
 */
const PAGE_SIZE = 24

const visibleCount = ref(PAGE_SIZE)

/** 絞り込みや並び替えで中身が変わったら最初に戻す。別の一覧を見ているのと同じなので */
watch(() => props.nurseries, () => {
  visibleCount.value = PAGE_SIZE
})

const visibleNurseries = computed(() => props.nurseries?.slice(0, visibleCount.value) ?? [])

const remaining = computed(() => count.value - visibleNurseries.value.length)

/*
 * データ基準日 (#111)。
 *
 * 全件が同じ値である前提には立たない。将来データ更新のタイミングがずれたときに
 * 嘘にならないよう、実際に並んでいる施設の値だけを見て、
 * 複数あるなら「施設により異なる」と断る。
 */
const sourceDateNote = computed(() => {
  const dates = [...new Set((props.nurseries ?? []).map(nursery => nursery.source_date).filter(Boolean))].sort()
  const newest = dates.at(-1)

  if (!newest) return null

  const formatted = formatSourceDate(newest)

  return dates.length === 1
    ? `${formatted}時点のデータです`
    : `${formatted}時点のデータです（施設により基準日が異なります）`
})
</script>

<template>
  <!--
    横幅と余白は親が決める (#166)。lg 以上では右カラムに入るので、
    自前の container を持つと親の余白と二重になる。

    読み込み中・0件・一覧の3状態を1つの根で包んでいるのは、
    複数根だと親から渡した class（幅の指定）が付かないため。
    @container を張るのは、下のカードの列数を画面幅ではなくこの枠の幅で決めるため。
  -->
  <div class="@container">
    <div
      v-if="status === 'pending'"
      class="py-16 flex flex-col items-center gap-3 text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary"
      />
      <p
        class="text-sm"
        role="status"
      >
        読み込み中です
      </p>
    </div>

    <div
      v-else-if="count === 0"
      class="py-16 text-center space-y-2"
    >
      <p>該当する保育所は見つかりませんでした。</p>
      <p class="text-sm text-muted">
        絞り込みの条件を減らすと見つかるかもしれません。
      </p>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p
          class="text-sm text-muted"
          role="status"
        >
          <span class="text-default font-medium tabular-nums">{{ count }}</span> 件
          <template v-if="showsTotal">
            <span class="tabular-nums">/ 全 {{ total }} 件</span>
          </template>
        </p>
        <!--
          基準日は絞り込みの結果ではないので role="status" の外に置く。
          中に入れると条件を変えるたびに読み上げられる。
        -->
        <p
          v-if="sourceDateNote"
          class="text-xs text-dimmed"
        >
          {{ sourceDateNote }}
        </p>
      </div>
      <!--
        一気に4カラムにすると1枚あたり 180px ほどしかなくカードが窮屈になるため、
        枠の幅に応じて段階的に増やす。

        画面幅ではなく枠の幅で決めている (#166)。lg 以上では左に絞り込みの
        320px があり、画面幅から列数を決めると 1280px で4列＝1枚 210px になって
        同じ窮屈さに戻ってしまう。@container なら実際に使える幅で判断できる。
      -->
      <div class="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 gap-4">
        <NurseryCard
          v-for="nursery in visibleNurseries"
          :key="nursery.nursery_id"
          :nursery="nursery"
        />
      </div>

      <!-- 残りの件数を必ず添える。あと何回押すことになるのか分からないと押す気にならない -->
      <div
        v-if="remaining > 0"
        class="mt-6 flex flex-col items-center gap-2"
      >
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-chevron-down"
          class="min-h-11 rounded-full font-bold"
          @click="visibleCount += PAGE_SIZE"
        >
          もっと見る
        </UButton>
        <p
          class="text-sm text-muted"
          role="status"
        >
          <span class="tabular-nums">{{ visibleNurseries.length }}</span> / <span class="tabular-nums">{{ count }}</span> 件を表示しています
        </p>
      </div>
    </div>
  </div>
</template>
