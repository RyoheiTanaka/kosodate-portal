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
  /** 土曜日も開所している園の数。`open_saturday` が「なし」の園は数えない */
  saturday: number
  /** 平日でいちばん早い開所時刻（`7:00`）。解釈できる値が無ければ空 */
  earliestOpen: string
  /** 平日でいちばん遅い閉所時刻（`20:00`）。解釈できる値が無ければ空 */
  latestClose: string
  /** いちばん小さい定員。定員が入っていない施設しか無ければ 0 */
  capacityMin: number
  /** いちばん大きい定員。定員が入っていない施設しか無ければ 0 */
  capacityMax: number
  /** 施設がある大字。多い順 */
  oaza: string[]
  /**
   * この施設群がまたがっている地区。多い順 (#151)。
   * エリア別ページから地区へ渡るための相互リンクに使う。
   */
  districts: Array<{ name: string, alphabet: string }>
  /** この施設群がまたがっているエリア。多い順。地区別ページからエリアへ渡るのに使う */
  areas: Array<{ name: string, alphabet: string }>
}

/**
 * 名前とURL用の識別子の組を、件数の多い順に重複なく並べる。
 *
 * エリアと地区は範囲が違うので、どのエリアがどの地区にまたがるかは固定の対応表を
 * 持てない。掲載データから実際にたどれる組み合わせだけを出す (#151)。
 */
const uniqueBy = (pairs: Array<{ name: string, alphabet: string }>): Array<{ name: string, alphabet: string }> => {
  const counts = new Map<string, { pair: { name: string, alphabet: string }, count: number }>()

  for (const pair of pairs) {
    if (!pair.name || !pair.alphabet) continue

    const found = counts.get(pair.alphabet)

    if (found) {
      found.count += 1
    } else {
      counts.set(pair.alphabet, { pair, count: 1 })
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).map(entry => entry.pair)
}

/** `7:30` を分に直す。文字列のまま比較すると `10:00` が `7:00` より前に来る */
const toMinutes = (time: string | null | undefined): number | null => {
  const matched = String(time ?? '').match(/^(\d{1,2}):(\d{2})$/)

  return matched ? Number(matched[1]) * 60 + Number(matched[2]) : null
}

/** 時刻の集まりから、いちばん早い（または遅い）ものを返す */
const pickTime = (times: Array<string | null | undefined>, kind: 'earliest' | 'latest'): string => {
  const valid = times.filter(time => toMinutes(time) !== null) as string[]

  if (valid.length === 0) return ''

  return valid.reduce((picked, time) =>
    (kind === 'earliest' ? toMinutes(time)! < toMinutes(picked)! : toMinutes(time)! > toMinutes(picked)!)
      ? time
      : picked,
  )
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

/**
 * 定員の最小・最大を返す。
 *
 * 定員が入っていない施設が混ざっても幅が 0 人から始まってしまわないよう、
 * 正の値だけを見る。取り出せる値が無ければ 0 を返し、呼び出し側で出し分ける。
 */
const pickCapacity = (nurseries: INursery[], kind: 'min' | 'max'): number => {
  const values = nurseries.map(nursery => nursery.capacity).filter(capacity => Number(capacity) > 0)

  if (values.length === 0) return 0

  return kind === 'min' ? Math.min(...values) : Math.max(...values)
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
  // 土曜は開所していない園があり、その場合 open_saturday に「なし」という文字列が入る
  saturday: nurseries.filter(nursery => toMinutes(nursery.open_saturday) !== null).length,
  earliestOpen: pickTime(nurseries.map(nursery => nursery.open_weekday), 'earliest'),
  latestClose: pickTime(nurseries.map(nursery => nursery.close_weekday), 'latest'),
  capacityMin: pickCapacity(nurseries, 'min'),
  capacityMax: pickCapacity(nurseries, 'max'),
  oaza: countBy(nurseries.map(nursery => extractOaza(nursery.address))).map(entry => entry.label),
  districts: uniqueBy(nurseries.map(nursery => ({ name: nursery.district, alphabet: nursery.district_alphabet }))),
  areas: uniqueBy(nurseries.map(nursery => ({ name: nursery.area, alphabet: nursery.area_alphabet }))),
})

/**
 * 区分・種別の件数を「保育所20園・小規模保育事業所1園」の形に整える。
 *
 * テンプレート側で v-for を組むと区切り文字の前後に改行由来の空白が入るので、
 * 文字列にしてから渡す。
 */
export const formatNurseryCounts = (items: Array<{ label: string, count: number }>): string =>
  items.map(item => `${item.label}${item.count}園`).join('・')
