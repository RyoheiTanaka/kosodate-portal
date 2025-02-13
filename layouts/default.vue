<template>
  <div class="min-h-screen flex flex-col">
    <Header class="w-full max-w-screen mx-auto" />

    <UContainer class="flex-1 py-6 w-full max-w-screen mx-auto">
      <UCard>
        <slot />
      </UCard>
    </UContainer>

    <Footer class="w-full max-w-screen mx-auto" />
  </div>
</template>
