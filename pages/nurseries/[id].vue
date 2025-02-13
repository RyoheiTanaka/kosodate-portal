<script setup lang="ts">
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const route = useRoute()
const nursery = {
  id: route.params.id,
  classification: '公立',
  type: '保育所',
  name: '大穂保育所',
  name_kana: '',
  prefecture: '茨城県',
  city: 'つくば市',
  address1: '大曽根',
  address2: '3410番地',
  address3: '',
  longitude: 140.085149,
  latitude: 36.13896,
  access: '',
  capacity: '120',
  establishment_date: 'S63.3',
  approval_date: '',
  tel: '029-864-0174',
  fax: '',
  corporate_number: '',
  corporate_name: 'つくば市',
  childcare_age: '６か月～５歳',
  shuttle_bus: '',
  available_day: '月～土',
  available_day_note: '祝日はお休み。12/29～1/3はお休み。',
  open_weekday: '7: 30',
  close_weekday: '19: 00',
  open_saturday: '7: 45',
  close_saturday: '13: 00',
  standard_childcare_hour_11: '7: 30~18: 30',
  standard_childcare_hour_8: '8: 30~16: 30',
  is_temporary_care: '',
  url: '',
  remark: '満１歳未満の児童の保育時間は 7: 45 から 18: 00 までです。',
}
</script>

<template>
  <div>
    <UContainer class="py-6 w-full max-w-screen-2xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">
        {{ nursery.name }}
      </h2>

      <UCard class="p-4 mx-auto">
        <template #header>
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
                  {{ nursery.shuttle_bus }}
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
                  {{ nursery.is_temporary_care }}
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
    </UContainer>
    <ULink
      to="/nurseries"
      class="block text-right underline"
      active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    >保育所一覧へ</ULink>
  </div>
</template>
