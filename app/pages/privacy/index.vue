<script setup lang="ts">
const links = [
  {
    label: 'トップ',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'プライバシーポリシー',
    icon: 'i-heroicons-lock-closed',
  },
]

useHead({
  title: 'プライバシーポリシー',
})

useSeoMeta({
  description: '子育てポータルのプライバシーポリシーです。お問い合わせで取得する情報の利用目的、「近い順」で使う位置情報の取り扱い、個人情報の管理と第三者提供についてご説明します。',
})
</script>

<template>
  <main class="py-4">
    <AppBreadcrumb
      :items="links"
    />
    <UContainer class="max-w-(--breakpoint-xl) w-full">
      <UCard>
        <template #header>
          <h1 class="text-3xl font-bold text-center">
            プライバシーポリシー
          </h1>
        </template>
        <h2 class="text-2xl font-bold">
          第1条（基本方針）
        </h2>
        <p class="mt-4">
          本サイト（以下、「当サイト」 ）では、ユーザーの個人情報を適切に管理し、プライバシー保護に努めます。
        </p>
        <h2 class="text-2xl font-bold mt-4">
          第2条（取得する情報と利用目的）
        </h2>
        <ul class="mt-4 ml-4 list-decimal">
          <li>お問い合わせフォームを利用する際に提供される情報</li>
        </ul>
        <ul class="mt-4 ml-8 list-disc">
          <li>名前、メールアドレス、お問い合わせ内容</li>
          <li>取得した情報は、お問い合わせ対応のためにのみ利用し、それ以外の目的で使用することはありません。</li>
        </ul>
        <!--
          距離順の並び替え (#87) で位置情報を扱うようになったため追加した条項。
          実装は app/composables/useNurseryBasePoint.ts。
          「送信も保存もしない」と書いている以上、サーバーへ座標を送る実装に変える場合は
          ここも必ず直すこと。
        -->
        <h2 class="text-2xl font-bold mt-4">
          第3条（位置情報の取り扱い）
        </h2>
        <p class="mt-4">
          認可保育所一覧の「近い順」の並び替えでは、お住まいの近くにある施設を探しやすくするために位置情報を利用します。
        </p>
        <ul class="mt-4 ml-8 list-disc">
          <li>位置情報を取得するのは、「近い順」を選択した場合のみです。ページを開いただけでは取得しません。</li>
          <li>取得にはブラウザの許可が必要です。許可しない場合でも、大字（地名）を選ぶことで並び替えをご利用いただけます。</li>
          <li>
            取得した位置情報は、施設までの直線距離を計算するためにご利用のブラウザ内でのみ使用します。<strong class="font-bold">当サイトのサーバーへ送信することも、保存することもありません。</strong>
          </li>
          <li>位置情報がURLに含まれることはありません。並び替えた状態のURLを共有しても、位置情報が相手に伝わることはありません。</li>
          <li>ブラウザを閉じると位置情報は破棄されます。</li>
        </ul>
        <!--
          外部への情報送信をまとめた条項 (#158)。
          改正電気通信事業法の外部送信規律で求められるのは「通知または公表」で、
          ここに書くことで要件を満たしている（同意バナーは出さない）。

          計測ツールや外部サービスを足すときは、必ずここにも追記すること。
          書かずに送信を始めると、この条項自体が嘘になる。
        -->
        <h2 class="text-2xl font-bold mt-4">
          第4条（外部サービスの利用）
        </h2>
        <p class="mt-4">
          当サイトでは、サイトの改善と安全な運用のために以下の外部サービスを利用しており、その過程でご利用状況の一部が各サービスの提供者へ送信されます。
        </p>
        <ul class="mt-4 ml-4 list-decimal">
          <li>アクセス解析（Google アナリティクス）</li>
        </ul>
        <ul class="mt-4 ml-8 list-disc">
          <li>どのページがどれくらい閲覧されたかを把握し、掲載内容や導線の改善に役立てるために利用します。</li>
          <li>Cookie などを用いてご利用状況を収集しますが、氏名や住所といった個人を特定する情報は含まれません。</li>
          <li>
            収集を望まれない場合は、<ULink
              to="https://tools.google.com/dlpage/gaoptout?hl=ja"
              target="_blank"
              class="underline"
              active-class="text-primary"
              inactive-class="text-muted hover:text-default"
            >Google アナリティクス オプトアウト アドオン</ULink>やブラウザの設定でCookieを無効にすることで停止できます。
          </li>
        </ul>
        <ul class="mt-4 ml-4 list-decimal">
          <li>スパム対策（Google reCAPTCHA）</li>
        </ul>
        <ul class="mt-4 ml-8 list-disc">
          <li>お問い合わせフォームの自動送信を防ぐために、お問い合わせページでのみ利用します。</li>
          <li>判定のため、IPアドレスや操作情報などが Google へ送信されます。</li>
          <li>
            取り扱いは Google の<ULink
              to="https://policies.google.com/privacy?hl=ja"
              target="_blank"
              class="underline"
              active-class="text-primary"
              inactive-class="text-muted hover:text-default"
            >プライバシーポリシー</ULink>および<ULink
              to="https://policies.google.com/terms?hl=ja"
              target="_blank"
              class="underline"
              active-class="text-primary"
              inactive-class="text-muted hover:text-default"
            >利用規約</ULink>によります。
          </li>
        </ul>
        <h2 class="text-2xl font-bold mt-4">
          第5条（個人情報の管理）
        </h2>
        <p class="mt-4">
          取得した個人情報は適切に管理し、不正アクセス・改ざん・漏洩が生じないように努めます。また、一定期間経過後、不要となった情報は適切に削除いたします。
        </p>
        <h2 class="text-2xl font-bold mt-4">
          第6条（個人情報の第三者提供）
        </h2>
        <p class="mt-4">
          当サイトでは、法令に基づく場合を除き、ユーザーの個人情報を第三者へ提供することはありません。
        </p>
        <h2 class="text-2xl font-bold mt-4">
          第7条（プライバシーポリシーの変更）
        </h2>
        <p class="mt-4">
          当サイトは、必要に応じて本ポリシーを変更することができるものとします。変更後のプライバシーポリシーは、当サイト上で告知された時点で効力を生じるものとします。
        </p>
        <h2 class="text-2xl font-bold mt-4">
          お問い合わせ
        </h2>
        <p class="mt-4">
          本ポリシーに関するお問い合わせは、<ULink
            to="/contact"
            class="underline"
            active-class="text-primary"
            inactive-class="text-muted hover:text-default"
          >お問い合わせ</ULink>までお願いいたします。
        </p>
      </UCard>
    </UContainer>
  </main>
</template>
