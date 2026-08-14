export default defineAppConfig({
  ui: {
    // v4 では色のエイリアスは ui.colors 配下に移動し、gray は neutral に改名された。
    // primary / secondary は assets/css/main.css の @theme で定義した独自スケールを指す。
    colors: {
      primary: 'kosodate-pink',
      secondary: 'kosodate-yellow',
      neutral: 'zinc',
    },
  },
})
