<script setup lang="ts">
import type { FormError } from '#ui/types'

interface ContactForm {
  name: string
  email: string
  message: string
}

interface FormErrors {
  email?: string
  message?: string
}

const { $csrfFetch } = useNuxtApp()

const links = [
  {
    label: 'トップ',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'お問い合わせ',
    icon: 'i-heroicons-envelope',
  },
]

const form = reactive<ContactForm>({
  name: '',
  email: '',
  message: '',
})

const errors = reactive<FormErrors>({})

const siteKey = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const validateForm = (state: ContactForm): FormError<string>[] => {
  const validationErrors: FormError<string>[] = []

  if (!state.email.trim()) {
    validationErrors.push({ name: 'email', message: 'メールアドレスは必須です' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    validationErrors.push({ name: 'email', message: '正しいメールアドレスを入力してください' })
  }

  if (!state.message.trim()) {
    validationErrors.push({ name: 'message', message: 'お問い合わせ内容は必須です' })
  }

  return validationErrors
}

const handleSubmit = async () => {
  if (validateForm(form).length > 0) return

  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const recaptchaToken = await grecaptcha.execute(siteKey, { action: 'submit' })
    const response = await $csrfFetch<{ message: string }>('/api/contacts', {
      method: 'POST',
      body: {
        ...form,
        recaptchaToken,
      },
    })

    successMessage.value = response.message
    Object.assign(form, { name: '', email: '', message: '' })
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)

    // API は createError で投げるので、画面に出す文言は data.message に入る。
    // 500 は Nitro が message を伏せるため、その場合はこちらの文言を使う
    const data = (error as { data?: { message?: string } }).data

    errorMessage.value = data?.message || '送信に失敗しました。しばらくしてからお試しください。'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'お問い合わせ',
  script: [
    { src: `https://www.google.com/recaptcha/api.js?render=${siteKey}`, async: true, defer: true },
  ],

})

useSeoMeta({
  description: 'つくば市の子育てポータルへのお問い合わせフォームです。掲載内容の誤りのご指摘やご要望をお送りいただけます。',
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
            お問い合わせ
          </h2>
        </template>
        <UForm
          :state="form"
          :validate="validateForm"
          @submit="handleSubmit"
        >
          <UFormField
            label="お名前"
            name="name"
          >
            <UInput
              v-model="form.name"
              placeholder="お名前を入力してください"
              icon="i-heroicons-pencil"
            />
          </UFormField>
          <UFormField
            label="メールアドレス"
            name="email"
            class="mt-4"
            :error="errors.email"
            required
          >
            <UInput
              v-model="form.email"
              type="email"
              placeholder="メールアドレスを入力してください"
              icon="i-heroicons-envelope"
            />
          </UFormField>
          <UFormField
            label="お問い合わせ内容"
            name="message"
            class="mt-4"
            :error="errors.message"
            required
          >
            <UTextarea
              v-model="form.message"
              placeholder="お問い合わせ内容を入力してください"
            />
          </UFormField>
          <UButton
            type="submit"
            :loading="loading"
            class="mt-4"
            block
          >
            送信
          </UButton>
        </UForm>
        <UAlert
          v-if="successMessage"
          class="mt-4"
          :title="successMessage"
          icon="i-heroicons-rocket-launch"
        />
        <UAlert
          v-if="errorMessage"
          color="error"
          class="mt-4"
          :title="errorMessage"
          icon="i-heroicons-x-circle"
        />
      </UCard>
    </UContainer>
  </main>
</template>
