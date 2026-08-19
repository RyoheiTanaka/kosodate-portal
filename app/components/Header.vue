<template>
  <!--
    地はテーマのトークンに寄せている (#118)。
    bg-white / dark:bg-black を直に指定すると、ダークで本文（neutral-900 系）より
    黒くなってヘッダーだけ浮く。shadow-light-500 は main.css に定義が無く効いていなかった。
  -->
  <header class="sticky top-0 z-40 bg-default shadow-sm">
    <div class="container flex items-center justify-between py-3">
      <h1 class="text-xl font-bold">
        <ULink
          to="/"
          class="inline-flex items-center min-h-10"
        >子育てポータル</ULink>
      </h1>
      <!--
        ナビのリンクは文字だけだと高さが24pxしかなく、指では狙いにくかった (#129)。
        上下に余白を持たせて押せる面を40pxまで広げている（見た目の位置は変えていない）。
      -->
      <div class="flex items-center gap-1">
        <nav class="flex gap-2">
          <ULink
            to="/"
            class="inline-flex items-center min-h-10 px-2"
            active-class="text-primary"
            inactive-class="text-muted hover:text-default"
          >トップ</ULink>
          <ULink
            to="/nurseries"
            class="inline-flex items-center min-h-10 px-2"
            active-class="text-primary"
            inactive-class="text-muted hover:text-default"
          >認可保育所</ULink>
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
      </div>
    </div>
  </header>
</template>
