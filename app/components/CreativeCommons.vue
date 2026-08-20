<template>
  <!--
    つくば市オープンデータ利用規約が指定する「改変して利用する場合」の出典表記。
    https://www.city.tsukuba.lg.jp/opendata/1000081/1000084.html

      この【作品等】は以下の著作物を改変して利用しています。
      【タイトル】、つくば市・【その他の著作権者】、クリエイティブ・コモンズ・ライセンス表示4.0国際

    語順と区切り（読点区切りの3要素）は規約の指定に合わせているので、
    表記を変えるときは上記ページを確認すること（issue #113）。
    このデータの著作権者はつくば市のみのため、【その他の著作権者】は省略している。
  -->
  <div class="mt-4 md:mt-0">
    <p class="text-sm font-semibold">
      このサイトは以下の著作物を改変して利用しています。
    </p>
    <p class="text-sm mt-2">
      <ULink
        to="https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005842.html"
        class="underline"
        target="_blank"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >認可保育所等一覧</ULink>、つくば市、<ULink
        to="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        class="underline"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >クリエイティブ・コモンズ・ライセンス表示4.0国際</ULink>
    </p>
    <p class="text-sm mt-2">
      <ULink
        to="/license"
        class="underline"
        active-class="text-primary"
        inactive-class="text-muted hover:text-default"
      >
        詳細はこちら
      </ULink>
    </p>
  </div>
</template>
