<script setup lang="ts">
interface SearchForm {
  keyword: string
}

const router = useRouter()
const form = reactive<SearchForm>({
  keyword: '',
})

const config = useRuntimeConfig()
const globalAreas = config.public.globalAreas as Array<Area>
const globalDistricts = config.public.globalDistricts as Array<District>

// 検索ボタンを押した際の処理
const search = (e: Event): void => {
  e.preventDefault()
  if (Object.keys(validateForm()).length > 0) return

  if (!form.keyword.trim()) return
  router.push({ path: '/nurseries', query: { keyword: form.keyword } })
}

const validateForm = (): Record<string, string | undefined> => {
  const validationErrors: Record<string, string | undefined> = {}
  if (!form.keyword.trim()) {
    validationErrors.keyword = 'キーワードは必須です'
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
    <!--
      「認可保育所」の下に検索・エリア・地区の3つがぶら下がる構造だが、
      以前は見出しがすべて同じ h3 で、余白だけで区切っていたため、
      3つが認可保育所の中の話だと読み取れなかった。

      パステルの面で囲って親子関係を見た目に出し、見出しも h2 > h3 に直している。
      中の3つは白いカードに分けて、どこからどこまでが1つの探し方なのかを明確にする。
    -->
    <section class="container py-8">
      <!--
        地の色はピンクではなく黄色系のクリームにしている。
        ピンク（#ff69b4）は彩度が高く、面で敷くと目が疲れるため、
        アイコン・枠線・見出しの文字といった小さい面積の差し色に回している。
        見出しをピンクのベタ塗り + 白文字にするのも避ける（コントラスト比が 2:1 程度しかない）。
      -->
      <div class="rounded-3xl border-2 border-kosodate-yellow-200 bg-kosodate-yellow-50/60 p-4 sm:p-6 dark:border-kosodate-yellow-900/60 dark:bg-kosodate-yellow-950/20">
        <div class="mb-5 text-center">
          <h2 class="inline-flex items-center gap-2 rounded-full border-2 border-kosodate-pink-200 bg-default px-5 py-2 text-xl font-bold text-kosodate-pink-700 shadow-sm sm:text-2xl dark:border-kosodate-pink-800 dark:text-kosodate-pink-200">
            <UIcon
              name="i-lucide-baby"
              class="size-6 shrink-0"
              aria-hidden="true"
            />
            認可保育所
          </h2>
          <p class="mt-3 text-sm text-muted">
            つくば市の認可保育所・認定こども園・小規模保育事業所を、3つの方法で探せます。
          </p>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl bg-default p-4 shadow-sm sm:p-5">
            <SectionHeading
              title="キーワード検索"
              icon="i-lucide-search"
            />
            <!--
              受入年齢もAPIの検索対象には入っているが、案内には書かない。
              格納値が「６か月～５歳」「産休明け～５歳」という文字列で、
              検索は部分一致なので「3歳」と入れても0件になる。
              書くと機能すると思わせてしまう。年齢で絞る手段はフィルター側に置く (#108)
            -->
            <p class="mb-3 text-sm text-muted">
              保育所の名前・ふりがな・住所から探します。
            </p>
            <UForm
              :state="form"
              :validation="validateForm"
              class="flex gap-2"
              @submit="search"
            >
              <UInput
                v-model="form.keyword"
                name="keyword"
                label="検索キーワード"
                placeholder="例: みどりの、島名、つくば"
                size="lg"
                icon="i-lucide-search"
                :ui="{ base: 'rounded-full' }"
                class="w-full"
              />
              <UButton
                :disabled="!form.keyword.trim()"
                type="submit"
                size="lg"
                class="shrink-0 rounded-full px-6 font-bold"
              >
                検索
              </UButton>
            </UForm>
          </div>

          <!--
            エリアは一覧の主導線 (#86) なので、地区より前に置く。
            件数は出していない。ここに出すには全119件の取得が要るが、
            トップページは今のところデータを取っておらず、導線1つのために
            初期表示へ待ち時間を足すことになるため。件数は遷移先で出している。
          -->
          <div class="rounded-2xl bg-default p-4 shadow-sm sm:p-5">
            <SectionHeading
              title="エリアから探す"
              icon="i-lucide-map"
            />
            <p class="mb-3 text-sm text-muted">
              TXの駅と生活圏を軸にした7つのエリアから探します。
            </p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AreaCard
                v-for="area in globalAreas"
                :key="area.alphabet"
                :area="area"
              />
            </div>
          </div>

          <!--
            以前はここに地区名を描いた 500x500 の画像を6枚並べていた。
            中身は地区名の文字だけで地図ではなく、スマホでは正方形が6つ縦に積まれて
            画面数枚分の高さになっていたため、バッジに置き換えた。情報は失われていない。
          -->
          <div class="rounded-2xl bg-default p-4 shadow-sm sm:p-5">
            <SectionHeading
              title="地区から探す"
              icon="i-lucide-map-pin"
            />
            <p class="mb-3 text-sm text-muted">
              つくば市の公式区分（旧町村の6地区）から探します。
            </p>
            <ul class="flex flex-wrap gap-2">
              <li
                v-for="district in globalDistricts"
                :key="district.alphabet"
              >
                <ULink
                  :to="`/nurseries/${district.alphabet}`"
                  class="inline-flex items-center gap-1.5 rounded-full border-2 border-kosodate-yellow-300 bg-kosodate-yellow-100 px-4 py-2 text-sm font-bold text-kosodate-yellow-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-kosodate-yellow-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-kosodate-yellow-900 dark:bg-kosodate-yellow-950/60 dark:text-kosodate-yellow-100 dark:hover:border-kosodate-yellow-700"
                >
                  <UIcon
                    name="i-lucide-map-pin"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {{ district.name }}
                </ULink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-5 text-center">
          <UButton
            to="/nurseries"
            color="neutral"
            variant="outline"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-full bg-default font-bold"
          >
            すべての認可保育所を見る
          </UButton>
        </div>
      </div>
    </section>
  </main>
</template>
