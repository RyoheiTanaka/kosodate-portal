<template>
  <header class="sticky top-0 z-40 bg-white shadow-sm shadow-light-500 dark:bg-black">
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
      <nav class="flex gap-2">
        <ULink
          to="/"
          class="inline-flex items-center min-h-10 px-2"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >トップ</ULink>
        <ULink
          to="/nurseries"
          class="inline-flex items-center min-h-10 px-2"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >認可保育所</ULink>
      </nav>
    </div>
  </header>
</template>
