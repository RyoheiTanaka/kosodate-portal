/**
 * API が返す保育所の形。DB 側のドキュメント型は `server/models/Nursery.ts` の
 * `INurseryDocument`。`_id` は JSON 化した時点で文字列になるのでこちらは string で持つ。
 */
export interface INursery {
  _id: string
  classification: string
  type: string
  name: string
  name_kana: string
  /** フル住所。表示・検索はすべてこれを参照する (#84) */
  address: string
  /** 方書（ビル名・街区など） */
  address_note: string
  /** 市の公式区分（6地区）。データ属性と既存URLのために維持している */
  district: string
  district_alphabet: string
  /** 一覧の主導線となるエリア (#86)。住所の大字から scripts/data/oaza-area.json で判定する */
  area: string
  area_alphabet: string
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
