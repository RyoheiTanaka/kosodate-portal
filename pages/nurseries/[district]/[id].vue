<script setup lang="ts">
import type { District } from '~/types/global'
import type { NurseryRouteParams } from '~/types/route'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const route = useRoute()
const params = route.params as Partial<NurseryRouteParams>
const district = params.district ?? ''
const id = params.id ?? ''

const config = useRuntimeConfig()
const globalDistricts = config.public.globalDistricts as Array<District>
const globalDistrict = globalDistricts.find(globalDistrict => globalDistrict.alphabet == district) || { alphabet: '', name: '' }

const { data: nursery } = useNursery(district, id)

useHead({
  title: nursery.value?.name,
})
</script>

<template>
  <main class="py-4">
    <template v-if="nursery">
      <UBreadcrumb
        class="container pb-4"
        :links="[
          {
            label: 'トップ',
            icon: 'i-heroicons-home',
            to: '/',
          },
          {
            label: '認可保育所一覧',
            icon: 'i-heroicons-building-office-2',
            to: '/nurseries',
          },
          {
            label: globalDistrict.name,
            icon: 'i-heroicons-clipboard-document-list',
            to: `/nurseries/${globalDistrict.alphabet}`,
          },
          {
            label: nursery.name,
            icon: 'i-heroicons-information-circle',
          },
        ]"
      />
      <UCard class="mb-6 w-full max-w-screen-2xl mx-auto">
        <template #header>
          <h2 class="text-3xl font-bold text-center mb-4">
            {{ nursery.name }}
          </h2>
          <iframe
            class="w-full h-[30rem]"
            frameborder="0"
            style="border:0"
            referrerpolicy="no-referrer-when-downgrade"
            :src="`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${nursery.name},${nursery.prefecture}${nursery.city}${nursery.address1}${nursery.address2}${nursery.address3}&center=${nursery.latitude},${nursery.longitude}`"
            allowfullscreen
          />
        </template>

        <div class="w-full">
          <div class="flex flex-col">
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  区分
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.classification }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  種別
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.type }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  住所
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.prefecture }}{{ nursery.city }}{{ nursery.address1 }}{{ nursery.address2 }}{{ nursery.address3 }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  アクセス方法
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.access }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  定員
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.capacity }}人
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  保育年齢
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.childcare_age }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  利用可能曜日
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.available_day }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  利用可能日時特記事項
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.available_day_note }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  開園（平日）
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.open_weekday }} ~ {{ nursery.close_weekday }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  開園（土曜日）
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.open_saturday }} ~ {{ nursery.close_saturday }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  保育標準時間（施設が定める11時間）
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.standard_childcare_hour_11 }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  保育標準時間（施設が定める8時間）
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.standard_childcare_hour_8 }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  電話
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.tel }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  FAX番号
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.fax }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  送迎バス
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.shuttle_bus ? '有' : '無' }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  一時預かりの有無
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.is_temporary_care ? '有' : '無' }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  法人番号
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.corporate_number }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  団体名
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.corporate_name }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  設立年月日
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.establishment_date }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  認可等年月日
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.approval_date }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  URL
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.url }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 rounded-sm border-b border-stroke">
              <div class="p-2.5 xl:p-5">
                <h3 class="text-sm font-medium text-gray-500 xsm:text-base">
                  備考
                </h3>
              </div>
              <div class="p-2.5 xl:p-5">
                <p class="text-sm font-medium text-black xsm:text-base">
                  {{ nursery.remark }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </template>
    <ULink
      to="/nurseries"
      class="block text-right underline"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >認可保育所一覧へ</ULink>
  </main>
</template>
