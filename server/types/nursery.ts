import type { Types } from 'mongoose'

export interface INursery {
  _id: string | Types.ObjectId
  classification: string
  type: string
  name: string
  name_kana: string
  prefecture: string
  city: string
  address1: string
  address2: string
  address3: string
  district: string
  longitude: number
  latitude: number
  access: string
  capacity: number
  establishment_date: string
  approval_date: string
  tel: string
  fax: string
  corporate_number: string
  corporate_name: string
  childcare_age: string
  shuttle_bus: boolean
  available_day: string
  available_day_note: string
  open_weekday: string
  close_weekday: string
  open_saturday: string
  close_saturday: string
  standard_childcare_hour_11: string
  standard_childcare_hour_8: string
  is_temporary_care: boolean
  url: string
  remark: string
}
