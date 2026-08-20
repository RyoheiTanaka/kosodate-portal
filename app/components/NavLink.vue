<template>
  <nav class="flex gap-4 mb-4 justify-between mx-auto flex-col md:flex-row md:justify-normal lg:mx-0 ">
    <ULink
      to="/"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >トップ</ULink>
    <ULink
      to="/nurseries"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >認可保育所</ULink>
    <ULink
      to="/faq"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >よくある質問</ULink>
    <ULink
      to="/contact"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >お問い合わせ</ULink>
    <ULink
      to="/license"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >ライセンス</ULink>
    <ULink
      to="/terms"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >利用規約</ULink>
    <ULink
      to="/privacy"
      active-class="text-primary"
      inactive-class="text-muted hover:text-default"
    >プライバシーポリシー</ULink>
  </nav>
</template>
