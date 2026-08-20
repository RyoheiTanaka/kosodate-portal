<script setup lang="ts">
/**
 * エリア・地区へ移るチップの列 (#166)。
 *
 * 一覧の「エリアから探す」、エリア別の「ほかのエリア」、地区別の「ほかの地区」が
 * 同じ形をしていたので1つにまとめた。
 *
 * ## スマホでは折り返さず横スクロール1行にする
 *
 * 7個を折り返すと 375px の画面で2〜3行になり、136px 使うこともある。
 * カードをファーストビューに入れるために削りたい高さなので、1行に流す。
 * 画面端まではみ出させて「まだ右に続く」ことが見えるようにしている。
 *
 * sm 以上は横幅が足りるので、従来どおり折り返す。
 *
 * 見た目は #129 の経緯を引き継ぐ。size="sm" の素のボタンだと「桜」のような短い
 * ラベルで 32×28px しかなく指で狙いにくかったので、min-h-10 で押せる面を確保する。
 */
const props = defineProps<{
  /** チップにする一覧。エリアでも地区でも同じ形で渡せる */
  items: Array<{ alphabet: string, name: string, icon?: string }>
  /** リンク先の前半。`${basePath}/${alphabet}` になる */
  basePath: string
  /** nav の aria-label。「エリア」「ほかの地区」など、置かれる文脈で変わる */
  label: string
  /** 現在地の alphabet。渡すとそのチップだけ色を変えて aria-current を付ける */
  current?: string
  /** item に icon が無いときのアイコン。地区のように全部同じ絵柄で足りる場合に使う */
  fallbackIcon?: string
}>()

const nav = useTemplateRef<HTMLElement>('nav')

/*
 * 現在地のチップを見える位置に送る。
 *
 * 1行に流すと、末尾に近いエリアを開いたときに自分のチップが画面外にあり、
 * 「どこにいるか」も「他にもあること」も分からない。
 *
 * nav の中だけを動かす（ページはスクロールさせない）。
 */
onMounted(() => {
  if (!props.current || !nav.value) return

  // 折り返している（sm 以上）なら全部見えているので動かす必要が無い。
  // ここで抜けないと、nav が画面外にある短い画面でページのほうが動いてしまう。
  if (nav.value.scrollWidth <= nav.value.clientWidth) return

  const chip = nav.value.querySelector('[aria-current="page"]')
  chip?.scrollIntoView({ block: 'nearest', inline: 'center' })
})
</script>

<template>
  <nav
    ref="nav"
    class="flex gap-2 overflow-x-auto -mx-4 px-4 py-1 -my-1 sm:flex-wrap sm:overflow-x-visible sm:mx-0 sm:px-0"
    :aria-label="label"
  >
    <UButton
      v-for="item in items"
      :key="item.alphabet"
      :to="`${basePath}/${item.alphabet}`"
      :icon="item.icon ?? fallbackIcon"
      :color="item.alphabet === current ? 'primary' : 'neutral'"
      :variant="item.alphabet === current ? 'subtle' : 'outline'"
      size="sm"
      class="min-h-10 shrink-0 rounded-full font-bold"
      :aria-current="item.alphabet === current ? 'page' : undefined"
    >
      {{ item.name }}
    </UButton>
  </nav>
</template>
