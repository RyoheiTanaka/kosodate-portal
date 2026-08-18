<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import type { INursery } from '~~/server/types/nursery'

const props = defineProps<{
  nurseries: INursery[] | null
  /** useFetch の status。読み込み中と 0 件を見分けるために受け取る */
  status: AsyncDataRequestStatus
  /** 絞り込み前の件数。渡されたときだけ「N件 / 全M件」の形で出す */
  total?: number
}>()

const count = computed(() => props.nurseries?.length ?? 0)

/** 絞り込みで件数が減っているときだけ母数を添える */
const showsTotal = computed(() => props.total !== undefined && props.total !== count.value)
</script>

<template>
  <UContainer
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
  </UContainer>

  <UContainer
    v-else-if="count === 0"
    class="py-16 text-center space-y-2"
  >
    <p>該当する保育所は見つかりませんでした。</p>
    <p class="text-sm text-muted">
      絞り込みの条件を減らすと見つかるかもしれません。
    </p>
  </UContainer>

  <UContainer
    v-else
    class="py-6 w-full max-w-(--breakpoint-2xl) mx-auto"
  >
    <p
      class="text-sm text-muted mb-4"
      role="status"
    >
      <span class="text-default font-medium tabular-nums">{{ count }}</span> 件
      <template v-if="showsTotal">
        <span class="tabular-nums">/ 全 {{ total }} 件</span>
      </template>
    </p>
    <!--
      md で一気に4カラムにすると1枚あたり 180px ほどしかなくカードが窮屈になるため、
      画面幅に応じて段階的に増やす
    -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NurseryCard
        v-for="nursery in nurseries"
        :key="nursery.nursery_id"
        :nursery="nursery"
      />
    </div>
  </UContainer>
</template>
