<script setup lang="ts">
/*
 * スマホではナビをハンバーガーに畳む。
 *
 * 375px では「子育てポータル」+ リンク2つ + 表示切り替えが横に並びきらず、
 * 見出しもリンクも2行に折り返してヘッダーが80pxになっていた
 * （表示切り替えを足した #118 以降）。
 *
 * 畳むのはリンクだけで、表示切り替えは畳まない。
 * メニューを開かないと切り替えられないのは、1タップで済んでいたものを遠くする。
 */
const links = [
  { label: 'トップ', to: '/', icon: 'i-heroicons-home' },
  { label: '認可保育所', to: '/nurseries', icon: 'i-heroicons-building-office-2' },
]

const open = ref(false)

// 遷移してもスライドオーバーは自動では閉じないので、リンクを押したら閉じる
const route = useRoute()
watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <!--
    地はテーマのトークンに寄せている (#118)。
    bg-white / dark:bg-black を直に指定すると、ダークで本文（neutral-900 系）より
    黒くなってヘッダーだけ浮く。shadow-light-500 は main.css に定義が無く効いていなかった。
  -->
  <header class="sticky top-0 z-40 bg-default shadow-sm">
    <div class="container flex items-center justify-between gap-2 py-3">
      <!--
        サイト名は h1 にしない (#151)。全ページで同じ文字列が h1 になると、
        そのページが何のページなのかを見出しで示せない。h1 は各ページの主見出しが持つ。
        見た目は変えないので、クラスはそのまま p に移している。
      -->
      <p class="text-xl font-bold">
        <ULink
          to="/"
          class="inline-flex items-center min-h-10 whitespace-nowrap"
        >子育てポータル</ULink>
      </p>

      <div class="flex items-center gap-1">
        <!--
          ナビのリンクは文字だけだと高さが24pxしかなく、指では狙いにくかった (#129)。
          上下に余白を持たせて押せる面を40pxまで広げている。
        -->
        <nav class="hidden sm:flex sm:gap-2">
          <ULink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center min-h-10 px-2 whitespace-nowrap"
            active-class="text-primary"
            inactive-class="text-muted hover:text-default"
          >{{ link.label }}</ULink>
        </nav>

        <!--
          ライト / ダークの切り替え (#118)。
          これまでは OS の設定に追従するだけで、サイト側から変える手段が無かった。

          UColorModeButton は中で useColorMode() を使っており、
          押すと preference が light / dark のどちらかに固定される。
          初期状態は system（OSの設定）のままで、押して初めて明示的な選択になる。

          アイコンは両方を描いて dark: で出し分ける作りなので、
          ハイドレーションを待たずに正しいほうが出る（ちらつかない）。
          aria-label は既定が英語なので日本語で上書きしている。
        -->
        <UColorModeButton
          size="md"
          class="min-h-10 min-w-10 justify-center"
          aria-label="ライトとダークの表示を切り替える"
        />

        <USlideover
          v-model:open="open"
          side="right"
          title="メニュー"
          :ui="{ content: 'w-72 max-w-[80vw]' }"
        >
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            class="sm:hidden min-h-10 min-w-10 justify-center"
            aria-label="メニューを開く"
          />

          <template #body>
            <nav class="flex flex-col">
              <ULink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 min-h-12 px-2 text-base"
                active-class="text-primary font-bold"
                inactive-class="text-default hover:text-primary"
              >
                <UIcon
                  :name="link.icon"
                  class="size-5 shrink-0"
                  aria-hidden="true"
                />
                {{ link.label }}
              </ULink>
            </nav>
          </template>
        </USlideover>
      </div>
    </div>
  </header>
</template>
