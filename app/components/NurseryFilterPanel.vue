<script setup lang="ts">
import type { NurseryFilters } from '~/composables/useNurseryFilters'

/**
 * 絞り込みと並び替えのツールバー。一覧・エリア別・地区別の3ページで共用する (#134)。
 *
 * 状態は `useNurseryFilters` が持つ。このコンポーネントは表示だけを担当し、
 * どの条件を出すか（`visible`）も composable の判断に従う。
 *
 * 条件が8つあるので1行に並べず、役割ごとに段を分けている。
 * キーワード / 場所と属性のセレクト / 設備のトグルと並び替え の3段。
 */
const props = defineProps<{
  filters: NurseryFilters
  /** セレクトの id が重複しないように前置きする。1ページに1つしか置かない想定だが念のため */
  idPrefix?: string
}>()

/*
 * setup で受け取り直す。
 *
 * テンプレートから `props.filters.state.x` を v-model すると
 * vue/no-mutating-props に引っかかる。実体は composable が所有する reactive で、
 * 親が差し替えることもないため、ここで取り出してしまってよい。
 */
const { state, visible, options, hasActiveFilters, hiddenUnknownShuttleBusCount, reset } = props.filters

const sortId = computed(() => `${props.idPrefix ?? 'nursery'}-sort`)
</script>

<template>
  <!--
    フィルターは一覧を絞るための道具なので、主役であるカードより目立たせない。
    見出しは支援技術のために残しつつ、視覚的には控えめなツールバーとして扱う。
  -->
  <section class="container">
    <h3 class="sr-only">
      絞り込みと並び替え
    </h3>
    <div class="rounded-lg border border-default p-4 flex flex-col gap-4">
      <!-- トップページの「キーワード検索」と同じものなので、呼び方を揃えている (#106) -->
      <UFormField label="キーワード">
        <UInput
          v-model="state.keyword"
          variant="outline"
          icon="i-heroicons-magnifying-glass"
          placeholder="名前・ふりがな・住所"
          class="w-full"
        />
      </UFormField>

      <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <!-- エリア別・地区別ページでは、その軸はパスで決まっているのでセレクトを出さない -->
        <UFormField
          v-if="visible.area"
          label="エリア"
          class="sm:flex-1 sm:min-w-52"
        >
          <USelect
            v-model="state.area"
            :items="options.areaOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField
          v-if="visible.district"
          label="地区"
          class="sm:flex-1 sm:min-w-40"
        >
          <USelect
            v-model="state.district"
            :items="options.districtOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="区分"
          class="sm:flex-1 sm:min-w-36"
        >
          <USelect
            v-model="state.classification"
            :items="options.classificationOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="種別"
          class="sm:flex-1 sm:min-w-48"
        >
          <USelect
            v-model="state.type"
            :items="options.typeOptions"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <UCheckbox
          v-model="state.bus"
          label="送迎バスあり"
        />
        <UCheckbox
          v-model="state.temporary"
          label="一時預かりあり"
        />
        <!--
          並び替えは絞り込みではないので「条件をクリア」の対象に含めない。
          件数が変わるものではなく、消したい条件でもないため。
        -->
        <div class="flex items-center gap-2 ms-auto">
          <label
            :for="sortId"
            class="text-sm text-muted shrink-0"
          >並び替え</label>
          <USelect
            :id="sortId"
            v-model="state.sort"
            :items="options.sortOptions"
            class="w-44"
          />
        </div>
        <UButton
          v-if="hasActiveFilters"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="reset()"
        >
          条件をクリア
        </UButton>
      </div>

      <!--
        送迎バスの情報が公開されていない園（すべて公立）は「あり」で絞ると消える。
        データが未公開なだけで、送迎バスが無いと確定したわけではないので断っておく (#108)。
      -->
      <p
        v-if="hiddenUnknownShuttleBusCount > 0"
        class="flex items-start gap-2 text-sm text-muted"
        role="status"
      >
        <UIcon
          name="i-heroicons-information-circle"
          class="size-4 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <span>
          送迎バスの情報が公開されていない
          <span class="tabular-nums">{{ hiddenUnknownShuttleBusCount }}</span> 件（公立保育所）は結果に含まれていません。
          送迎バスが無いと確定したわけではないため、各施設へお問い合わせください。
        </span>
      </p>
    </div>
  </section>
</template>
