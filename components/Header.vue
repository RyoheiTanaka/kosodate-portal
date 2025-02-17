<template>
  <UContainer class="py-4 flex justify-between items-center w-full max-w-screen-xl mx-auto border-b">
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
      >保育所</ULink>
    </nav>
  </UContainer>
</template>
