<template>
  <header class="sticky top-0 z-40 bg-white shadow-sm shadow-light-500 dark:bg-black">
    <div class="container flex items-center justify-between py-4">
      <h1 class="text-xl font-bold">
        <ULink to="/">子育てポータル</ULink>
      </h1>
      <nav class="flex gap-4">
        <ULink
          to="/"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >トップ</ULink>
        <ULink
          to="/nurseries"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >認可保育所</ULink>
      </nav>
    </div>
  </header>
</template>
