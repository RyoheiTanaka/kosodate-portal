export default defineAppConfig({
  ui: {
    // v4 では色のエイリアスは ui.colors 配下に移動し、gray は neutral に改名された。
    // primary / secondary は assets/css/main.css の @theme で定義した独自スケールを指す。
    colors: {
      primary: 'kosodate-main',
      secondary: 'kosodate-sub',
      neutral: 'zinc',
    },
    /*
     * パンくずのリンクは既定だと高さが20pxしかなく、スマホでは狙いにくい (#129)。
     * 4ページすべてに置いてあるので、呼び出し側ではなくここで一度だけ広げる。
     */
    breadcrumb: {
      slots: {
        link: 'py-2.5',
      },
    },
  },
})
