<script setup lang="ts">
import type { FormError } from '#ui/types'

interface SearchForm {
  keyword: string
}

interface FormErrors {
  keyword?: string
}

const router = useRouter()
const form = reactive<SearchForm>({
  keyword: '',
})

const errors = reactive<FormErrors>({})

// 検索ボタンを押した際の処理
const search = (e: Event): void => {
  e.preventDefault()
  if (validateForm().length > 0) return

  if (!form.keyword.trim()) return
  router.push({ path: '/nurseries', query: { keyword: form.keyword } })
}

const validateForm = (): FormError<string>[] => {
  const validationErrors: FormError<string>[] = []
  if (!form.keyword.trim()) {
    errors.keyword = 'キーワードは必須です'
    validationErrors.push({ path: 'keyword', message: errors.keyword })
  } else {
    errors.keyword = ''
  }

  return validationErrors
}
</script>

<template>
  <main>
    <div class="relative mx-auto">
      <NuxtImg
        width="1400"
        height="800"
        class="object-cover w-full h-[420px] lg:h-[560px] xl:h-[640px]"
        src="/images/main-visual.jpg"
        alt="Hero image"
        loading="eager"
        sizes="sm:100vw md:1400px"
        fetchpriority="high"
        preload
        placeholder
        placeholder-class="blur-xl"
      />
      <div class="container absolute inset-0 flex flex-col items-start justify-center bg-gradient-to-l from-gray-200 md:bg-none">
        <h2 class="text-3xl font-bold md:mb-4 md:text-4xl lg:text-6xl">
          子育てポータル
        </h2>
        <h3 class="text-lg font-bold md:mb-4 lg:text-3xl">
          子育て情報掲載サイト
        </h3>
        <div class="max-w-sm mb-8 text-md font-light lg:max-w-md text-balance">
          <p>つくば市が公開しているデータをまとめて掲載しています。</p>
        </div>
        <NuxtLink
          class="px-6 py-3 font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-800"
          to="/license"
        >掲載情報詳細はこちら</NuxtLink>
      </div>
    </div>
    <div class="py-6 container">
      <h3 class="text-2xl font-bold text-center mb-4">
        認可保育所
      </h3>
      <section class="mt-4">
        <h3 class="text-2xl font-bold text-center mb-4">
          キーワード検索
        </h3>
        <UForm
          :state="form"
          :validation="validateForm"
          class="flex justify-center"
          @submit="search"
        >
          <UInput
            v-model="form.keyword"
            name="keyword"
            label="検索キーワード"
            placeholder="検索キーワードを入力"
            class="w-full max-w-md"
          />
          <UButton
            :disabled="!form.keyword.trim()"
            class="ml-4"
            type="submit"
          >
            検索
          </UButton>
        </UForm>
      </section>
      <section class="mt-4">
        <h3 class="text-2xl font-bold text-center mb-4">
          地域別一覧
        </h3>
        <div class="container md:grid md:grid-cols-3 md:gap-4">
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/oho"
              class="inline-block"
            >
              <NuxtImg
                src="/images/oho.png"
                alt="大穂地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/toyosato"
              class="inline-block"
            >
              <NuxtImg
                src="/images/toyosato.png"
                alt="豊里地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/yatabe"
              class="inline-block"
            >
              <NuxtImg
                src="/images/yatabe.png"
                alt="谷田部地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/sakura"
              class="inline-block"
            >
              <NuxtImg
                src="/images/sakura.png"
                alt="桜地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/tsukuba"
              class="inline-block"
            >
              <NuxtImg
                src="/images/tsukuba.png"
                alt="筑波地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
          <div class="mt-4 text-center">
            <ULink
              to="/nurseries/kukisaki"
              class="inline-block"
            >
              <NuxtImg
                src="/images/kukisaki.png"
                alt="茎崎地区"
                class="border rounded-md mx-auto"
                loading="eager"
                preload
                placeholder
                placeholder-class="blur-xl"
              />
            </ULink>
          </div>
        </div>
      </section>
      <div>
        <div class="container text-right py-6">
          <div>
            <ULink
              class="underline "
              to="/nurseries"
              active-class="text-primary"
              inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >認可保育所一覧へ</ULink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
