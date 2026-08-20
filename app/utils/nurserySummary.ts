import type { INursery } from '~~/server/types/nursery'

/**
 * エリア別・地区別ページに置く要約 (#151)。
 *
 * どちらのページも見出しと施設リスト以外ほぼ同じで、重複コンテンツに見える状態だった。
 * かといって地域の紹介文を書き起こすと、データに無いこと（駅からの徒歩分数など）を
 * 書いてしまう。ここで作るのは**すべて掲載データから数えた事実**で、
 * エリアごとに数字が変わるので結果として文面も変わる。
 *
 * 質問に短く答える塊（見出し＋箇条書き＋数値）は AI 検索にも拾われやすい。
 *
 * エリア（#86 の主導線）と地区（市の公式区分）は別軸だが、要約の作り方は同じなので
 * ここは施設の配列だけを受け取る。名前に area / district を入れないのはそのため。
 */

export interface NurserySummary {
  /** 施設数 */
  total: number
  /** 区分（公立・民間）ごとの件数。0件の区分は含まない */
  classifications: Array<{ label: string, count: number }>
  /** 種別（保育所・認定こども園・小規模保育事業所）ごとの件数。0件の種別は含まない */
  types: Array<{ label: string, count: number }>
  /** 0歳児クラスがある園の数 */
  fromZero: number
  /** 一時預かりを行っている園の数 */
  temporaryCare: number
  /** 送迎バスがある園の数 */
  shuttleBus: number
  /** 送迎バスの有無が不明な園の数。公立は市が情報を公開していない */
  shuttleBusUnknown: number
  /** 施設がある大字。多い順 */
  oaza: string[]
}

/** 値ごとの件数を数え、多い順に並べる */
const countBy = (values: string[]): Array<{ label: string, count: number }> => {
  const counts = new Map<string, number>()

  for (const value of values) {
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export const buildNurserySummary = (nurseries: INursery[]): NurserySummary => ({
  total: nurseries.length,
  classifications: countBy(nurseries.map(nursery => nursery.classification)),
  types: countBy(nurseries.map(nursery => nursery.type)),
  fromZero: nurseries.filter(nursery => parseChildcareAges(nursery.childcare_age)?.includes(0)).length,
  temporaryCare: nurseries.filter(nursery => nursery.is_temporary_care).length,
  shuttleBus: nurseries.filter(nursery => nursery.shuttle_bus === true).length,
  // null は「不明」であって「無し」ではない (#151)。件数を分けて出し、丸めない
  shuttleBusUnknown: nurseries.filter(nursery => nursery.shuttle_bus === null || nursery.shuttle_bus === undefined).length,
  oaza: countBy(nurseries.map(nursery => extractOaza(nursery.address))).map(entry => entry.label),
})

/**
 * 区分・種別の件数を「保育所20園・小規模保育事業所1園」の形に整える。
 *
 * テンプレート側で v-for を組むと区切り文字の前後に改行由来の空白が入るので、
 * 文字列にしてから渡す。
 */
export const formatNurseryCounts = (items: Array<{ label: string, count: number }>): string =>
  items.map(item => `${item.label}${item.count}園`).join('・')
