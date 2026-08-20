import type { ModuleOptions as CsurfOptions } from 'nuxt-csurf'

/*
 * routeRules に csurf を書けるようにする型の補い (#151)。
 *
 * nuxt-csurf は `declare module 'nitropack'` で NitroRouteConfig を拡張しているが、
 * Nuxt 4.5 の routeRules の型は `nitropack/types` から解決される。そのため拡張が
 * 届かず、動作はするのに typecheck だけが落ちる。同じ拡張をこちらで当てておく。
 */
declare module 'nitropack/types' {
  interface NitroRouteConfig {
    csurf?: Partial<CsurfOptions> | false
  }
}

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/image', 'nuxt-csurf', '@nuxt/eslint', '@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-seo-utils', 'nuxt-gtag'],
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
  /*
   * 閲覧系ページを CDN に載せる (#151 追記1の項目2)。
   *
   * これまで X-Vercel-Cache は常に MISS だった。nuxt-csurf が全レスポンスに
   * Set-Cookie を付けており、cookie が付いたレスポンスは CDN が原理的に
   * キャッシュできないため。クロールのたびに関数が起動して Mongo に全件を投げていた。
   *
   * 閲覧系は GET しかない。csurf を切って cookie を出さないようにし、ISR に載せる。
   * CSRF が要るのは問い合わせの POST だけなので、そちらは既定のまま守られる
   * （ここに書いていない経路は csurf 有効）。
   *
   * expiration はデータの更新頻度に合わせている。取り込みは月1の保守枠 (#115) なので
   * 1時間の陳腐化は許容できる。取り込み直後に反映を急ぐ場合は再デプロイでキャッシュが切れる。
   */
  routeRules: {
    '/': { csurf: false, isr: { expiration: 3600 } },
    '/nurseries': { csurf: false, isr: { expiration: 3600 } },
    '/nurseries/**': { csurf: false, isr: { expiration: 3600 } },
    '/faq': { csurf: false, isr: { expiration: 3600 } },
    '/license': { csurf: false, isr: { expiration: 3600 } },
    '/terms': { csurf: false, isr: { expiration: 3600 } },
    '/privacy': { csurf: false, isr: { expiration: 3600 } },
    // 一覧が引く全件API。中身は月1でしか変わらないので同じ扱いにする
    '/api/nurseries': { csurf: false, isr: { expiration: 3600 } },
  },
  compatibilityDate: '2026-08-14',
  csurf: {
    /*
     * リクエストの時点でトークンを作って event.context に載せる。
     * /api/csrf がこれを返し、問い合わせフォームは送信直前にそれを取りに行く。
     *
     * 従来はSSR時に埋め込まれる <meta name="csrf-token"> を使っていたが、
     * 閲覧系ページで csurf を切ると cookie（=秘密）が発行されないため、
     * 一覧からクライアント遷移で問い合わせページへ来た場合に meta のトークンだけが
     * あって cookie が無い状態になり、送信が 403 になる。
     */
    addCsrfTokenToEventCtx: true,
  },
  eslint: {
    checker: true,
    config: {
      stylistic: {
        braceStyle: '1tbs',
      },
    },
  },
  /*
   * GA4 (#158)。測定IDは実行時の環境変数 NUXT_PUBLIC_GTAG_ID で渡す。
   * VITE_* の値と違いビルド時に焼き込まれないので、Vercel 側の設定変更だけで差し替えられる。
   * IDが未設定の環境（ローカル開発など）では nuxt-gtag が何も読み込まない。
   *
   * 同意バナーは出さない。改正電気通信事業法の外部送信規律で求められるのは
   * 「通知または公表」で、プライバシーポリシーへの明記で要件を満たすため。
   */
  gtag: {
    // ページ遷移の計測は gtag 側の既定（SPAの履歴変更を自動送信）に任せる
    enabled: true,
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
