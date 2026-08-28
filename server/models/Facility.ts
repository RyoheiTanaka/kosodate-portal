import type { Document, Types } from 'mongoose'
import { Schema, model } from 'mongoose'
import type { IFacility } from '~~/server/types/facility'

// API 側の `IFacility` は `_id: string` なので、DB 側は差し替えて ObjectId で持つ
interface IFacilityDocument extends Omit<IFacility, '_id'>, Document {
  _id: Types.ObjectId
}

// つくば市のオープンデータに必ず入っている項目だけ required にする。
// 公式ページや方書のように種別によって無い列は必須にしない。
const FacilitySchema = new Schema<IFacilityDocument>({
  type: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  address_note: { type: String, default: '' },
  postal_code: { type: String, default: '' },
  area: { type: String, default: '' },
  area_alphabet: { type: String, default: '', index: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  tel: { type: String, default: '' },
  url: { type: String, default: '' },
  attributes: { type: Object, default: {} },
  source_name: { type: String, required: true },
  source_url: { type: String, required: true },
  source_date: { type: String, default: '' },
  is_active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

// 保育所の `nursery_id` にあたる市が振った番号が、どのデータセットにも無い。
// 種別の中で名称は重複しないため、`type` + `name` を upsert のキーにしている。
// 座標を混ぜないのは、市が座標だけ直したときに別施設として増えてしまうため。
// 施設名が変わった場合は「新規 + 一覧から消えた」として取り込みの差分に出る。
FacilitySchema.index({ type: 1, name: 1 }, { unique: true })

export const Facility = model<IFacilityDocument>('Facility', FacilitySchema)
