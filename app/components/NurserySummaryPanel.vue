<script setup lang="ts">
import type { INursery } from '~~/server/types/nursery'

/*
 * エリア別・地区別ページの下に置く要約 (#151)。
 *
 * どちらのページも見出しと施設リスト以外ほぼ同じで、検索エンジンからは同じ内容の
 * ページが並んでいるように見えていた。ここで出すのは**掲載データから数えた事実だけ**で、
 * 区分ごとに数字も地名も変わるので、結果として文面が重ならない。
 *
 * 地域の紹介文は書き起こさない。駅からの徒歩分数のような、手元のデータに無い情報を
 * 書くことになるため。
 */
const props = defineProps<{
  /** 見出し。「〇〇エリアの認可保育所」「〇〇の認可保育所」 */
  title: string
  /** 導入文の前半。エリアの範囲説明など。件数の文はこの後ろに自動で続く */
  lead: string
  /** 対象の施設 */
  nurseries: INursery[]
  /**
   * 相互リンクとして出す軸 (#151)。
   * エリア別ページなら 'district'、地区別ページなら 'area' を渡す。
   * エリアと地区は範囲が違うので固定の対応表は持てない。掲載データから
   * 実際にたどれる組み合わせだけを出す。
   */
  relatedAxis?: 'district' | 'area'
}>()

const summary = computed(() => buildNurserySummary(props.nurseries))

/*
 * 相互リンク。要約の最後に1行だけ置く。
 * ボタンにすると他エリアへの導線（上部にある丸ボタン）と同じ強さになってしまうので、
 * 文中のリンクにとどめる。主導線はエリアで (#86)、これは補助でしかない。
 */
const related = computed(() => {
  if (props.relatedAxis === 'district') {
    return {
      // 'district' を渡すのはエリア別ページなので、主語はエリア
      label: 'このエリアの保育所がある地区',
      items: summary.value.districts.map(item => ({ name: item.name, to: `/nurseries/${item.alphabet}` })),
    }
  }

  if (props.relatedAxis === 'area') {
    return {
      // 'area' を渡すのは地区別ページなので、主語は地区
      label: 'この地区の保育所があるエリア',
      items: summary.value.areas.map(item => ({ name: item.name, to: `/nurseries/area/${item.alphabet}` })),
    }
  }

  return null
})

/*
 * 送迎バスの null は「不明」であって「無し」ではない。
 * 公立は市が情報を公開していないので、不明の件数も添える (#151)。
 */
const shuttleBusText = computed(() => {
  const { shuttleBus, shuttleBusUnknown } = summary.value

  return shuttleBusUnknown > 0
    ? `送迎バスがある園: ${shuttleBus}園（ほかに有無が不明な園が${shuttleBusUnknown}園あります）`
    : `送迎バスがある園: ${shuttleBus}園`
})
</script>

<template>
  <UContainer
    v-if="summary.total > 0"
    class="mt-4"
  >
    <section class="rounded-lg border border-default p-4">
      <h2 class="font-bold mb-2">
        {{ title }}
      </h2>
      <p class="text-sm text-muted mb-3">
        {{ lead }}掲載している認可保育所は{{ summary.total }}園です。
      </p>
      <ul class="text-sm space-y-1 list-disc ml-5">
        <li>区分: {{ formatNurseryCounts(summary.classifications) }}</li>
        <li>種別: {{ formatNurseryCounts(summary.types) }}</li>
        <li>0歳児クラスがある園: {{ summary.fromZero }}園</li>
        <li>一時預かりを行っている園: {{ summary.temporaryCare }}園</li>
        <li>{{ shuttleBusText }}</li>
        <li>掲載している地域: {{ summary.oaza.join('・') }}</li>
      </ul>
      <p
        v-if="related && related.items.length > 0"
        class="text-sm text-muted mt-3"
      >
        {{ related.label }}:
        <!--
          区切りの「・」は CSS で入れる。テンプレートに文字として書くと、
          要素間の改行が空白として残って「地区A ・ 地区B」になる
          （空白だけのノードは Vue が落とすが、文字を含むノードは残る）。
        -->
        <ULink
          v-for="item in related.items"
          :key="item.to"
          :to="item.to"
          class="underline not-first:before:content-['・'] before:no-underline"
          active-class="text-primary"
          inactive-class="text-muted hover:text-default"
        >{{ item.name }}</ULink>
      </p>
      <p class="text-xs text-muted mt-3">
        件数はつくば市が公開しているデータ（{{ formatSourceDate(nurseries[0]?.source_date) || '公開時点' }}時点）をもとにしています。
      </p>
    </section>
  </UContainer>
</template>
