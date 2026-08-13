import type { Types } from 'mongoose'

export interface INursery {
  _id: string | Types.ObjectId
  classification: string
  type: string
  name: string
  name_kana: string
  /** フル住所。将来的に prefecture / city / address1-3 を置き換える (#84) */
  address: string
  /** 方書（ビル名・街区など） */
  address_note: string
  prefecture: string
  city: string
  address1: string
  address2: string
  address3: string
  district: string
  district_alphabet: string
  longitude: number
  latitude: number
  capacity: number
  establishment_date: string
  tel: string
  corporate_name: string
  childcare_age: string
  /** 送迎バス。null は「不明」（公立保育所は市が情報を公開していない） */
  shuttle_bus: boolean | null
  available_day: string
  available_day_note: string
  open_weekday: string
  close_weekday: string
  open_saturday: string
  close_saturday: string
  standard_childcare_hour_11: string
  standard_childcare_hour_8: string
  is_temporary_care: boolean
  remark: string
  nursery_id: number
  /** 閉園・廃止した施設は false。詳細ページは残すため削除はしない */
  is_active: boolean
  /** データ基準日（例: 2026-04-01） */
  source_date: string
  createdAt?: Date
  updatedAt?: Date
}
