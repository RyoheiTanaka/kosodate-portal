/**
 * 詳細ページの「ラベル : 値」表を組み立てる。
 *
 * 市の配布データは版によって項目が増減し、施設によって空のままの項目もある。
 * 表示するかどうかの判断をテンプレート側に散らすと項目追加のたびに書き換えが要るため、
 * 並び順・整形・空欄の扱いをここに集約する。
 */

import type { INursery } from '~~/server/types/nursery'

export interface NurseryDetailRow {
  label: string
  value: string
  /** 値ではなく「情報がない」ことを伝える行。控えめな見た目で表示する */
  muted?: boolean
}

/** 開所時間のように始まりと終わりが別カラムに入っている値をひとつの文字列にする */
const formatRange = (from: string, to: string): string => {
  if (from && to) return `${from} ~ ${to}`

  return from || to || ''
}

/**
 * 送迎バスは `null` が「不明」を意味する（公立保育所は市が情報を公開していない）。
 * 空欄にすると「無」と読み違えられるため、問い合わせ先を添えた行として残す。
 */
const shuttleBusRow = (shuttleBus: boolean | null | undefined): NurseryDetailRow => {
  if (shuttleBus === null || shuttleBus === undefined) {
    return { label: '送迎バス', value: '情報なし（施設へお問い合わせください）', muted: true }
  }

  return { label: '送迎バス', value: shuttleBus ? '有' : '無' }
}

export const buildNurseryDetailRows = (nursery: INursery): NurseryDetailRow[] => {
  const rows: NurseryDetailRow[] = [
    { label: '区分', value: nursery.classification },
    { label: '種別', value: nursery.type },
    { label: '住所', value: `${nursery.address ?? ''}${nursery.address_note ?? ''}` },
    { label: '定員', value: nursery.capacity ? `${nursery.capacity}人` : '' },
    { label: '保育年齢', value: nursery.childcare_age },
    { label: '利用可能曜日', value: nursery.available_day },
    { label: '利用可能日時特記事項', value: nursery.available_day_note },
    { label: '開園（平日）', value: formatRange(nursery.open_weekday, nursery.close_weekday) },
    { label: '開園（土曜日）', value: formatRange(nursery.open_saturday, nursery.close_saturday) },
    { label: '保育標準時間（施設が定める11時間）', value: nursery.standard_childcare_hour_11 },
    { label: '保育標準時間（施設が定める8時間）', value: nursery.standard_childcare_hour_8 },
    { label: '電話', value: nursery.tel },
    shuttleBusRow(nursery.shuttle_bus),
    { label: '一時預かりの有無', value: nursery.is_temporary_care ? '有' : '無' },
    { label: '団体名', value: nursery.corporate_name },
    { label: '設立年月日', value: nursery.establishment_date },
    { label: '備考', value: nursery.remark },
  ]

  // 値のない項目は行ごと出さない。空欄が並ぶより、載っていない方が読みやすい
  return rows.filter(row => row.value?.trim())
}
