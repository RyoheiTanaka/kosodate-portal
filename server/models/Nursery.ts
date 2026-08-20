import type { Document, Types } from 'mongoose'
import { Schema, model } from 'mongoose'
import type { INursery } from '~~/server/types/nursery'

// API 側の `INursery` は `_id: string` なので、DB 側は差し替えて ObjectId で持つ
interface INurseryDocument extends Omit<INursery, '_id'>, Document {
  _id: Types.ObjectId
}

// つくば市のオープンデータで提供される項目のみ required とする。
// 定員や開所時間は「入所のご案内」PDF由来で、新設園は後追いになるため必須にしない。
const NurserySchema = new Schema<INurseryDocument>({
  classification: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  name_kana: { type: String, default: '' },
  address: { type: String, required: true },
  address_note: { type: String, default: '' },
  // 郵便番号は市のデータに無く、日本郵便の郵便番号データから大字で引いて入れる (#151)。
  // 一意に決められない大字は空のままにする（推測で埋めない）
  postal_code: { type: String, default: '' },
  district: { type: String, required: true },
  district_alphabet: { type: String, required: true },
  // エリアは取り込み時に住所の大字から判定して入れる (#86)。
  // 一覧の絞り込みに使うので index を張る。取り込み前の既存ドキュメントには
  // 存在しないため required にはしない。
  area: { type: String, default: '' },
  area_alphabet: { type: String, default: '', index: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  capacity: { type: Number, default: null },
  establishment_date: { type: String, default: '' },
  tel: { type: String, default: '' },
  corporate_name: { type: String, default: '' },
  childcare_age: { type: String, default: '' },
  // null は「不明」。公立保育所は市が送迎バス情報を公開していないため断定できない
  shuttle_bus: { type: Boolean, default: null },
  available_day: { type: String, default: '' },
  available_day_note: { type: String, default: '' },
  open_weekday: { type: String, default: '' },
  close_weekday: { type: String, default: '' },
  open_saturday: { type: String, default: '' },
  close_saturday: { type: String, default: '' },
  standard_childcare_hour_11: { type: String, default: '' },
  standard_childcare_hour_8: { type: String, default: '' },
  is_temporary_care: { type: Boolean, default: false },
  remark: { type: String, default: '' },
  nursery_id: { type: Number, required: true, unique: true, index: true },
  is_active: { type: Boolean, default: true, index: true },
  source_date: { type: String, default: '' },
}, { timestamps: true })

export const Nursery = model<INurseryDocument>('Nursery', NurserySchema)
