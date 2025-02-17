<template>
  <nav class="flex gap-4 mb-4 justify-between mx-auto flex-col md:flex-row md:justify-normal lg:mx-0 ">
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
    <ULink
      to="/contact"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >お問い合わせ</ULink>
    <ULink
      to="/license"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >ライセンス</ULink>
    <ULink
      to="/terms"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >利用規約</ULink>
    <ULink
      to="/privacy"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >プライバシーポリシー</ULink>
  </nav>
</template>
