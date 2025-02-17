<script setup lang="ts">
useHead({
  title: 'プライバシーポリシー',
})
</script>

<template>
  <UContainer>
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
      <h3 class="text-2xl font-bold mt-4">
        第3条（個人情報の管理）
      </h3>
      <p class="mt-4">
        取得した個人情報は適切に管理し、不正アクセス・改ざん・漏洩が生じないように努めます。また、一定期間経過後、不要となった情報は適切に削除いたします。
      </p>
      <h3 class="text-2xl font-bold mt-4">
        第4条（個人情報の第三者提供）
      </h3>
      <p class="mt-4">
        当サイトでは、法令に基づく場合を除き、ユーザーの個人情報を第三者へ提供することはありません。
      </p>
      <h3 class="text-2xl font-bold mt-4">
        第5条（プライバシーポリシーの変更）
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
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >お問い合わせ</ULink>までお願いいたします。
      </p>
    </UCard>
  </UContainer>
</template>
