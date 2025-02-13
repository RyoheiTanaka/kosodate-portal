<template>
  <UContainer class="py-4 flex justify-between items-center w-full max-w-screen-xl mx-auto border-b">
    <h1 class="text-xl font-bold">
      子育てポータル
    </h1>
    <nav class="flex gap-4">
      <ULink
        to="/"
        active-class="text-primary"
      >トップ</ULink>
      <ULink
        to="/nurseries"
        active-class="text-primary"
      >保育所</ULink>
    </nav>
  </UContainer>
</template>
