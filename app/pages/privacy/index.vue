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
  description: '子育てポータルのプライバシーポリシーです。取得する情報とその利用目的、アクセス解析についてご説明します。',
})
</script>

<template>
  <main class="py-4">
    <UBreadcrumb
      class="container pb-4"
      :items="links"
    />
    <UContainer class="max-w-(--breakpoint-xl) w-full">
      <UCard>
        <template #header>
          <h2 class="text-3xl font-bold text-center">
            プライバシーポリシー
          </h2>
        </template>
        <h3 class="text-2xl font-bold">
          第1条（基本方針）
        </h3>
        <p class="mt-4">
          本サイト（以下、「当サイト」 ）では、ユーザーの個人情報を適切に管理し、プライバシー保護に努めます。
        </p>
        <h3 class="text-2xl font-bold mt-4">
          第2条（取得する情報と利用目的）
        </h3>
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
        <h3 class="text-2xl font-bold mt-4">
          第3条（位置情報の取り扱い）
        </h3>
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
        <h3 class="text-2xl font-bold mt-4">
          第4条（個人情報の管理）
        </h3>
        <p class="mt-4">
          取得した個人情報は適切に管理し、不正アクセス・改ざん・漏洩が生じないように努めます。また、一定期間経過後、不要となった情報は適切に削除いたします。
        </p>
        <h3 class="text-2xl font-bold mt-4">
          第5条（個人情報の第三者提供）
        </h3>
        <p class="mt-4">
          当サイトでは、法令に基づく場合を除き、ユーザーの個人情報を第三者へ提供することはありません。
        </p>
        <h3 class="text-2xl font-bold mt-4">
          第6条（プライバシーポリシーの変更）
        </h3>
        <p class="mt-4">
          当サイトは、必要に応じて本ポリシーを変更することができるものとします。変更後のプライバシーポリシーは、当サイト上で告知された時点で効力を生じるものとします。
        </p>
        <h3 class="text-2xl font-bold mt-4">
          お問い合わせ
        </h3>
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
