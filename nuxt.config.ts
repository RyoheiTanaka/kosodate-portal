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
  image: {
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
      '2xl': 1536,
    },
  },
})
