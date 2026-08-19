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
     * パンくず。4ページすべてに置いてあるので、呼び出し側ではなくここで一度だけ直す。
     *
     * - link: 既定だと高さが20pxしかなく、スマホでは狙いにくい (#129)
     * - item / root / list: 収まらないときは縮めずに横スクロールさせる
     *
     * 既定では item に min-w-0、ラベルに truncate が付いており、幅が足りないと
     * 全項目が均等に縮む。375px の詳細ページでは4項目すべてが切れて
     * 「ト…」「認可保育…」となり、どこにいるのか読めなかった。
     *
     * item を shrink-0 にすると各項目は自然な幅のままになり、
     * はみ出したぶんは root 側の横スクロールで読める（truncate は効かなくなる）。
     * 縦の高さは変わらないので、一覧の先頭が押し下げられることもない。
     */
    breadcrumb: {
      slots: {
        root: 'overflow-x-auto',
        list: 'flex-nowrap',
        item: 'shrink-0',
        link: 'py-2.5',
      },
    },
  },
})
