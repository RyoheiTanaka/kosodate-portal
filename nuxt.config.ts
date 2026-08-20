export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/image', 'nuxt-csurf', '@nuxt/eslint', '@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-seo-utils'],
  devtools: { enabled: true },
  // Tailwind v4 は設定ファイルではなく CSS 側で定義する
  css: ['~/assets/css/main.css'],
  /*
   * canonical / sitemap / robots が参照する正規のオリジン (#151)。
   * ここ1箇所を直せば各モジュールの出力が揃う。
   */
  site: {
    url: 'https://kosodate-portal.coolat.net',
    name: '子育てポータル',
  },
  runtimeConfig: {
    public: {
      // 市の公式区分。データ属性と既存URL（/nurseries/[district]/[id]）のために維持する。
      // 一覧の主導線は下の globalAreas（#86）
      globalDistricts: [
        { name: '大穂地区', alphabet: 'oho' },
        { name: '豊里地区', alphabet: 'toyosato' },
        { name: '谷田部地区', alphabet: 'yatabe' },
        { name: '桜地区', alphabet: 'sakura' },
        { name: '筑波地区', alphabet: 'tsukuba' },
        { name: '茎崎地区', alphabet: 'kukisaki' },
      ],
      // 一覧の主導線となるエリア軸 (#86)。
      // 6地区は谷田部だけで約半分（119件中65件）を占め、絞り込みとして機能していないため、
      // TXの駅と生活圏を軸に切り直した区分を別に持つ。北から南の順に並べている。
      // 大字との対応は scripts/data/oaza-area.json。件数はこの順に 22/14/18/15/10/22/18。
      //
      // エリアの「桜」は地区の「桜地区」とは範囲が違う（並木・大角豆・倉掛・千現は南部、
      // 吾妻・竹園はつくば駅周辺に入る）。名前が似ているので混同しないこと。
      // icon / tone は見た目のための情報。エリアを文字だけで並べると拾い読みしづらいので、
      // 目印になるアイコンと色味を持たせている。tone は隣が同じ色で続かないよう配分している。
      globalAreas: [
        { name: '北部（筑波・大穂・豊里）', alphabet: 'hokubu', description: '筑波山麓から大穂・豊里まで。市の北側', icon: 'i-lucide-mountain', tone: 'pink' },
        { name: '桜', alphabet: 'sakura', description: '桜・松塚・上ノ室など、中心部の北東側', icon: 'i-lucide-flower-2', tone: 'yellow' },
        { name: 'つくば駅周辺', alphabet: 'tsukuba-station', description: '吾妻・竹園・春日・松代など、TXつくば駅の周辺', icon: 'i-lucide-train-front', tone: 'pink' },
        { name: '研究学園', alphabet: 'kenkyugakuen', description: '研究学園・学園の森・苅間など、TX研究学園駅の周辺', icon: 'i-lucide-graduation-cap', tone: 'yellow' },
        { name: '万博記念公園', alphabet: 'banpaku', description: '島名・真瀬など、TX万博記念公園駅の周辺', icon: 'i-lucide-ferris-wheel', tone: 'pink' },
        { name: 'みどりの・谷田部', alphabet: 'midorino', description: 'みどりの・谷田部・上横場など、TXみどりの駅から谷田部の市街地', icon: 'i-lucide-sprout', tone: 'yellow' },
        { name: '南部（並木・茎崎）', alphabet: 'nanbu', description: '並木・大角豆から茎崎まで。市の南側', icon: 'i-lucide-trees', tone: 'pink' },
      ],
    },
  },
  compatibilityDate: '2026-08-14',
  eslint: {
    checker: true,
    config: {
      stylistic: {
        braceStyle: '1tbs',
      },
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
  robots: {
    // 全許可のまま。Sitemap: の宣言はモジュールが site.url から自動で足す
    disallow: [],
  },
  /*
   * canonical はクエリを落として正規URLに寄せる (#151)。
   * 既定では sort / page / search などが canonical に残るが、一覧の中身は
   * 並び順や絞り込みが変わっても同じ119件なので、すべて /nurseries に集約する。
   */
  seo: {
    canonicalQueryWhitelist: [],
    /*
     * URLの末尾セグメントから title を補完する既定の挙動を切る。
     * 全ページで title を明示しているので不要なうえ、存在しない施設のURL
     * （/nurseries/yatabe/99999）で `99999 - 子育てポータル` という title が
     * 生成されてしまう。
     */
    fallbackTitle: false,
  },
  /*
   * 詳細・地区別・エリア別は動的ルートなのでモジュール側が自動では拾えない。
   * DBの全件から /api/__sitemap__/urls で列挙している。
   */
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    // 問い合わせ・規約類は検索結果に出す価値が無いので除外する
    exclude: ['/contact', '/privacy', '/terms', '/license'],
  },
})
