import type { Document, Types } from 'mongoose'
import { Schema, model } from 'mongoose'
import type { INursery } from '~/server/types/nursery'

interface INurseryDocument extends INursery, Document {
  _id: Types.ObjectId
}

const NurserySchema = new Schema<INurseryDocument>({
  classification: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  name_kana: { type: String, required: true },
  prefecture: { type: String, required: true },
  city: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String, required: true },
  address3: { type: String, required: true },
  district: { type: String, required: true },
  district_alphabet: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  access: { type: String, required: true },
  capacity: { type: Number, required: true },
  establishment_date: { type: String, required: true },
  approval_date: { type: String, required: true },
  tel: { type: String, required: true },
  fax: { type: String, required: true },
  corporate_number: { type: String, required: true },
  corporate_name: { type: String, required: true },
  childcare_age: { type: String, required: true },
  shuttle_bus: { type: Boolean, required: true },
  available_day: { type: String, required: true },
  available_day_note: { type: String, required: true },
  open_weekday: { type: String, required: true },
  close_weekday: { type: String, required: true },
  open_saturday: { type: String, required: true },
  close_saturday: { type: String, required: true },
  standard_childcare_hour_11: { type: String, required: true },
  standard_childcare_hour_8: { type: String, required: true },
  is_temporary_care: { type: Boolean, required: true },
  url: { type: String, required: true },
  remark: { type: String, required: true },
  nursery_id: { type: Number, required: true },
})

export const Nursery = model<INurseryDocument>('Nursery', NurserySchema)
