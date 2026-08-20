<script setup lang="ts">
/*
 * よくある質問 (#151 フェーズ3)。
 *
 * 質問と回答の形は検索でも AI 検索でも拾われやすく、一覧・エリア別への内部リンクの
 * ハブにもなる。ただし**掲載データから答えられることだけ**を自分で答える。
 *
 * 入園申込の時期・保育料・認可外との違いは、年度ごとに変わるか制度側の話なので、
 * つくば市の公式ページへ送る。ここに書き写すと、市が更新した瞬間に古い情報になる。
 * リンク先はいずれも実在を確認済み（2026-08-20）。
 */
const { data: nurseries } = useNurseries()

const summary = computed(() => buildNurserySummary(nurseries.value ?? []))

/** データ基準日。全件同じ値が入る */
const sourceDate = computed(() => formatSourceDate(nurseries.value?.[0]?.source_date))

const links = [
  {
    label: 'トップ',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'よくある質問',
    icon: 'i-heroicons-question-mark-circle',
  },
]

useHead({
  title: 'よくある質問',
})

useSeoMeta({
  description: () => `つくば市の認可保育所について、掲載データから答えられる質問をまとめました。園の数、0歳から預けられる園、一時預かりや送迎バスのある園、土曜日の開所、開所時間などを${summary.value.total || ''}園ぶんのデータから集計しています。`,
})

/*
 * FAQPage の構造化データ。
 *
 * Google はリッチリザルトとしての FAQ 表示を政府・医療系のサイトに絞っているため、
 * これで検索結果の見た目が変わることは期待していない。ページの意味を機械可読にする
 * ためだけに出している。回答は画面に出しているものと同じ文言で、ここだけの内容は書かない。
 */
useHead(() => ({
  script: nurseries.value
    ? [jsonLdScript({
        '@type': 'FAQPage',
        'mainEntity': dataQuestions.value.map(item => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
        })),
      })]
    : [],
}))

/**
 * 掲載データから答えられる質問。
 * 回答の文言は構造化データと共用するので、テンプレートに直接書かずここで組み立てる。
 */
const dataQuestions = computed(() => {
  const s = summary.value

  return [
    {
      question: 'つくば市に認可保育所はいくつありますか？',
      answer: `${s.total}園を掲載しています。区分は${formatNurseryCounts(s.classifications)}、種別は${formatNurseryCounts(s.types)}です。`,
      to: '/nurseries',
      linkLabel: '認可保育所一覧を見る',
    },
    {
      question: '0歳から預けられる園はどれくらいありますか？',
      answer: `${s.fromZero}園に0歳児クラスがあります（産休明けからの受け入れを含みます）。受入年齢は園ごとに違うので、詳細ページでご確認ください。`,
      to: '/nurseries',
      linkLabel: '一覧で受入年齢を見る',
    },
    {
      question: '一時預かりをしている園はありますか？',
      answer: `${s.temporaryCare}園が一時預かりを行っています。実施日や利用条件は園によって異なります。`,
      to: '/nurseries?temporary=1',
      linkLabel: '一時預かりのある園を見る',
    },
    {
      question: '送迎バスがある園はありますか？',
      answer: `${s.shuttleBus}園に送迎バスがあります。ただし${s.shuttleBusUnknown}園は市が情報を公開しておらず、有無が分かりません（無いとは限りません）。`,
      to: '/nurseries?bus=1',
      linkLabel: '送迎バスがある園を見る',
    },
    {
      question: '土曜日も預けられますか？',
      answer: `${s.saturday}園が土曜日も開所しています。開所時間は平日と違う園が多く、午前中までの園もあります。`,
      to: '/nurseries',
      linkLabel: '一覧で開所曜日を見る',
    },
    {
      question: '何時から何時まで開いていますか？',
      answer: `平日はいちばん早い園で${s.earliestOpen}に開き、いちばん遅い園で${s.latestClose}まで開所しています。園ごとの時間は詳細ページに掲載しています。`,
      to: '/nurseries',
      linkLabel: '一覧で開所時間を見る',
    },
    {
      question: '家の近くの園を探すには？',
      answer: '一覧の「近くの園を探す」を押すと、現在地からの直線距離が近い順に並びます。位置情報の利用を許可しない場合でも、地名を選べば同じように並び替えられます。位置情報はブラウザの中だけで使い、サーバーへ送信も保存もしません。',
      to: '/nurseries',
      linkLabel: '近い順で探す',
    },
    {
      question: 'エリアと地区は何が違いますか？',
      answer: 'エリアはつくばエクスプレスの駅と生活圏をもとにこのサイトで区分した7つの区分で、地区はつくば市の公式区分による6つの区分です。範囲が違うため、たとえばエリアの「桜」と「桜地区」は同じ範囲ではありません。園を探すときはエリアのほうが件数の偏りが少なく使いやすくなっています。',
      to: '/nurseries/area',
      linkLabel: 'エリアから探す',
    },
    {
      question: '掲載しているデータはいつ時点のもので、出典はどこですか？',
      answer: `つくば市が公開しているオープンデータをもとにしており、${sourceDate.value || '公開時点'}時点の内容です。定員・開所時間・送迎バス・一時預かりなどは変更される場合があるため、最新の情報は各施設へ直接お問い合わせください。`,
      to: '/license',
      linkLabel: '出典とライセンスを見る',
    },
  ]
})

/*
 * 掲載データでは答えられない質問。制度側の話や年度ごとに変わる情報なので、
 * ここでは答えを書かず、市の該当ページへ送る。
 */
const cityLinks = [
  {
    question: '入園の申込みはいつ、どうやってするのですか？',
    note: '受付期間や必要書類は年度ごとに変わります。',
    items: [
      { label: '保育所の申込み（4月入所）', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1015515.html' },
      { label: '保育所の申込み（4月以外の入所）', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005842.html' },
    ],
  },
  {
    question: '誰が申し込めますか？保育所とはどういう施設ですか？',
    note: '入所の要件（就労・妊娠出産・介護など）は市が定めています。',
    items: [
      { label: '保育所について', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1015514.html' },
    ],
  },
  {
    question: '保育料はいくらですか？',
    note: '世帯の状況によって決まるため、このサイトでは扱っていません。',
    items: [
      { label: '利用者負担額（保育料等）', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1015517.html' },
    ],
  },
  {
    question: '認可外保育施設について知りたい',
    note: 'このサイトが掲載しているのは認可保育所等のみです。',
    items: [
      { label: '認可外保育施設', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005657.html' },
    ],
  },
  {
    question: '一時預かりの制度について知りたい',
    note: 'どの園が実施しているかはこのサイトで絞り込めますが、制度の説明は市のページにあります。',
    items: [
      { label: '一時預かり', to: 'https://www.city.tsukuba.lg.jp/kosodate/kosodate/hoikujo/1005658.html' },
    ],
  },
]
</script>

<template>
  <main class="py-4">
    <AppBreadcrumb :items="links" />
    <h1 class="text-3xl font-bold text-center mb-4">
      よくある質問
    </h1>

    <UContainer class="max-w-(--breakpoint-xl) w-full">
      <section>
        <h2 class="text-xl font-bold mb-1">
          掲載データから分かること
        </h2>
        <p class="text-sm text-muted mb-4">
          このサイトが掲載している{{ summary.total }}園のデータを集計した答えです。
        </p>

        <div class="space-y-5">
          <div
            v-for="item in dataQuestions"
            :key="item.question"
            class="rounded-lg border border-default p-4"
          >
            <h3 class="font-bold mb-2">
              {{ item.question }}
            </h3>
            <p class="text-sm">
              {{ item.answer }}
            </p>
            <p class="mt-2">
              <ULink
                :to="item.to"
                class="inline-flex items-center min-h-10 text-sm"
                active-class="text-primary"
                inactive-class="text-muted hover:text-default"
              ><span class="underline underline-offset-4">{{ item.linkLabel }}</span></ULink>
            </p>
          </div>
        </div>
      </section>

      <!--
        制度側の話は書き写さない。年度ごとに変わるものが多く、こちらに写すと
        市が更新した瞬間に古い情報になる (#151)。
      -->
      <section class="mt-8">
        <h2 class="text-xl font-bold mb-1">
          つくば市の公式ページで確認すること
        </h2>
        <p class="text-sm text-muted mb-4">
          申込みや保育料は年度ごとに変わるため、このサイトでは扱っていません。市の案内をご覧ください。
        </p>

        <div class="space-y-5">
          <div
            v-for="item in cityLinks"
            :key="item.question"
            class="rounded-lg border border-default p-4"
          >
            <h3 class="font-bold mb-2">
              {{ item.question }}
            </h3>
            <p class="text-sm text-muted">
              {{ item.note }}
            </p>
            <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 -ml-2">
              <li
                v-for="link in item.items"
                :key="link.to"
              >
                <ULink
                  :to="link.to"
                  target="_blank"
                  class="inline-flex items-center min-h-10 px-2 text-sm"
                  active-class="text-primary"
                  inactive-class="text-muted hover:text-default"
                ><span class="underline underline-offset-4">{{ link.label }}（つくば市）</span></ULink>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </UContainer>
  </main>
</template>
