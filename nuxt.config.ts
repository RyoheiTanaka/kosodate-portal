export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      globalDistricts: [
        { name: '大穂地区', alphabet: 'oho' },
        { name: '豊里地区', alphabet: 'toyosato' },
        { name: '谷田部地区', alphabet: 'yatabe' },
        { name: '桜地区', alphabet: 'sakura' },
        { name: '筑波地区', alphabet: 'tsukuba' },
        { name: '茎崎地区', alphabet: 'kukisaki' },
      ],
    },
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
