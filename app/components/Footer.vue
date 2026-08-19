<template>
  <UContainer
    class="py-4 text-center w-full max-w-(--breakpoint-xl) mx-auto border-t border-default text-toned p-6"
    as="footer"
  >
    <UContainer class="flex justify-between flex-col lg:flex-row">
      <NavLink />
      <CreativeCommons />
    </UContainer>
    <!-- text-gray-700 / text-gray-500 は dark の指定が無く、暗い地で沈んでいた (#118) -->
    <p class="mt-4 text-sm text-muted">
      © 2025 子育てポータル. All rights reserved.
    </p>
  </UContainer>
</template>
