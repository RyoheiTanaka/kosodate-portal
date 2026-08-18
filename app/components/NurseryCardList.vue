<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import type { INursery } from '~~/server/types/nursery'

defineProps<{
  nurseries: INursery[] | null
  /** useFetch の status。読み込み中と 0 件を見分けるために受け取る */
  status: AsyncDataRequestStatus
}>()
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
    v-else-if="!nurseries || nurseries.length === 0"
    class="py-16 text-center text-muted"
  >
    <p>該当する保育所は見つかりませんでした。</p>
  </UContainer>

  <UContainer
    v-else
    class="py-6 w-full max-w-(--breakpoint-2xl) mx-auto md:grid md:grid-cols-4 md:gap-4"
  >
    <NurseryCard
      v-for="nursery in nurseries"
      :key="nursery.nursery_id"
      :nursery="nursery"
    />
  </UContainer>
</template>
