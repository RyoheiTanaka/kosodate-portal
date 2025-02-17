<template>
  <UContainer>
    <h2 class="text-3xl font-bold text-center">
      ライセンス・クレジット表記
    </h2>
    <div class="mt-4">
      <p>このサイトは、以下のオープンデータを利用・改変して作成されています。</p>
      <ul class="pl-0 mt-4 ml-4 list-disc">
        <li class="mb-2">
          <ULink
            to="https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005842.html"
            target="_blank"
            class="underline"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >「認可保育所等一覧」</ULink>（つくば市）
        </li>
      </ul>
    </div>
    <div class="mt-4">
      <p>
        本データは
        <ULink
          to="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          class="underline"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          クリエイティブ・コモンズ・ライセンス表示4.0国際
        </ULink>
        に基づき提供されています。
      </p>
    </div>
  </UContainer>
</template>
