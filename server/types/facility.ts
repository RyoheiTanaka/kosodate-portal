/**
 * 認可保育所以外の子育て施設。API が返す形。
 * DB 側のドキュメント型は `server/models/Facility.ts` の `IFacilityDocument`。
 *
 * 保育所（`INursery`）とは別のコレクションで持つ (#122)。保育標準時間・送迎バス・
 * 認可区分といった保育所固有の項目は他の種別に存在せず、1つにまとめると
 * 空フィールドだらけになるため。
 *
 * 逆に、施設種別どうしは持つ項目がほとんど同じ（名称・住所・電話・座標）なので、
 * 種別ごとにコレクションを分けず `type` で区別する。種別固有の項目は `attributes`
 * に寄せる。
 */
export interface IFacility {
  _id: string
  /** 施設種別。`jidokan`（児童館）など。URL とデータの絞り込みの軸になる */
  type: string
  name: string
  /** フル住所。市のデータは市名が付かないものがあるため、取り込み時に補う */
  address: string
  /** 方書（建物名・併設先など） */
  address_note: string
  /** 郵便番号（`305-0071` 形式）。大字から一意に決められない場合は空 */
  postal_code: string
  /** エリア (#86)。保育所と同じ軸で持つので、施設をまたいだ絞り込みができる */
  area: string
  area_alphabet: string
  longitude: number
  latitude: number
  tel: string
  /** 施設の公式ページ。市のデータに列が無い種別では空 */
  url: string
  /**
   * 種別固有の項目。児童クラブの受入対象小学校、支援拠点の実施日時など。
   * 種別ごとに列が違うぶんをここに逃がし、共通部分だけをトップレベルに置く。
   */
  attributes: Record<string, string>
  /** 出典データセット名。CC BY の表示義務はデータセット単位で発生する (#113) */
  source_name: string
  /** 出典の公開ページ */
  source_url: string
  /** データ基準日（例: 2026-04-01）。ソースごとに違う (#111) */
  source_date: string
  /** 一覧から消えた施設は false。詳細ページのURLを残すため削除はしない */
  is_active: boolean
  createdAt?: Date
  updatedAt?: Date
}
