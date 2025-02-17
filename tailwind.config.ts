import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff69b4', // ビビッドピンク
          50: '#ffe4ec', // パステルピンク
          100: '#ffccdc',
          200: '#ff99b8',
          300: '#ff6693',
          400: '#ff336f',
          500: '#ff69b4', // メインカラー
          600: '#e0559d',
          700: '#c04787',
          800: '#a03a71',
          900: '#802d5b',
        },
        secondary: {
          DEFAULT: '#ffde59', // 明るい黄色
          50: '#fff7d4',
          100: '#ffeeaa',
          200: '#ffe480',
          300: '#ffda59',
          400: '#ffd033',
          500: '#ffde59', // メインの黄色
          600: '#e6c051',
          700: '#c0a246',
          800: '#9a843c',
          900: '#746630',
        },
      },
    },
  },
}
