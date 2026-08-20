<script setup lang="ts">
import type { NuxtError } from '#app'

/*
 * 全エラー共通のページ (#151)。
 * これが無いと Nuxt 既定の素の英語ページが出る。詳細ページの不正URL (#159) と
 * エリア不正で404を返すようになり、利用者が実際に踏む可能性が出てきたので用意した。
 *
 * app.vue の外側で描画されるためレイアウトは自動では当たらない。
 * ヘッダー・フッターを出すために NuxtLayout で包んでいる。
 */
const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error?.statusCode === 404)

/*
 * createError の message は場所によって「施設が見つかりません」「エリアが見つかりません」と
 * 具体的に書き分けている。どれを踏んだのか分かるほうが親切なので拾う。
 *
 * ただしルート自体が無い場合など Nuxt が自前で付ける message は英語（Page not found）なので、
 * 日本語を含むものだけを表示する。英語の原文をそのまま利用者に見せない。
 */
const detail = computed(() => {
  const message = props.error?.message ?? ''

  return /[^ -~]/.test(message) ? message : ''
})

/*
 * エラーページは app.vue ごと差し替わるので、app.vue の titleTemplate は効かない。
 * 同じ整形を当てて `ページが見つかりません - 子育てポータル` に揃える。
 */
useHead(() => ({
  title: isNotFound.value ? 'ページが見つかりません' : 'エラーが発生しました',
  titleTemplate,
}))

/*
 * エラーページからの遷移は clearError を通す。
 * href は残したいので NuxtLink のまま click だけ差し替えている
 * （中クリックや新しいタブで開く操作は click を発火しないので影響しない）。
 */
const navigate = (to: string) => clearError({ redirect: to })
</script>

<template>
  <NuxtLayout>
    <main class="flex-1 py-12">
      <UContainer class="max-w-(--breakpoint-md) w-full">
        <div class="text-center">
          <p class="text-6xl font-bold text-kosodate-main-600 sm:text-7xl dark:text-kosodate-main-300">
            {{ error?.statusCode ?? 500 }}
          </p>
          <h2 class="mt-4 text-2xl font-bold sm:text-3xl">
            {{ isNotFound ? 'ページが見つかりません' : 'エラーが発生しました' }}
          </h2>
          <p
            v-if="detail"
            class="mt-3 text-muted"
          >
            {{ detail }}
          </p>
          <p class="mt-3 text-muted text-balance">
            <template v-if="isNotFound">
              URLが変わったか、施設のページが取り下げられた可能性があります。下のリンクからお探しください。
            </template>
            <template v-else>
              しばらく時間をおいてからもう一度お試しください。繰り返し発生する場合はお問い合わせください。
            </template>
          </p>
        </div>

        <!--
          迷った人を一覧の入口に戻すのが目的なので、探し方を並べる。
          トップに戻すだけだと、また同じ導線を辿り直させることになる。
        -->
        <nav
          class="mt-8 flex flex-wrap justify-center gap-3"
          aria-label="お探しのページ"
        >
          <UButton
            to="/nurseries"
            icon="i-heroicons-building-office-2"
            size="lg"
            class="min-h-10"
            @click.prevent="navigate('/nurseries')"
          >
            認可保育所一覧
          </UButton>
          <UButton
            to="/nurseries/area"
            icon="i-heroicons-map"
            size="lg"
            variant="outline"
            class="min-h-10"
            @click.prevent="navigate('/nurseries/area')"
          >
            エリアから探す
          </UButton>
          <UButton
            to="/"
            icon="i-heroicons-home"
            size="lg"
            variant="outline"
            class="min-h-10"
            @click.prevent="navigate('/')"
          >
            トップへ戻る
          </UButton>
        </nav>

        <p class="mt-8 text-center text-sm text-muted">
          掲載内容の誤りに気づかれた場合は、<ULink
            to="/contact"
            class="underline"
            active-class="text-primary"
            inactive-class="text-muted hover:text-default"
            @click.prevent="navigate('/contact')"
          >お問い合わせ</ULink>からお知らせください。
        </p>
      </UContainer>
    </main>
  </NuxtLayout>
</template>
