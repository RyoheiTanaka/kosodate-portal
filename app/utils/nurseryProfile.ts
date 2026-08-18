/**
 * 一覧カードで受入年齢・開所曜日を図にするための、表示用パーサー。
 *
 * DB の値は市の配布データをそのまま取り込んでいるため全角の数字と `～` が使われており、
 * 表記も範囲形式（`１歳～５歳`）と列挙形式（`３・４・５歳児`）が混在している。
 * どちらにも当てはまらない値が将来増えても図を壊さないよう、
 * 解釈できなかった場合は null を返して呼び出し側で原文表示にフォールバックさせる。
 */

/** カードの年齢スケールの上限。認可保育所は就学前（5歳）まで */
const MAX_AGE = 5

/** 曜日の並び。開所曜日の範囲展開はこの順序を基準にする */
export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'] as const

export type Weekday = typeof WEEKDAYS[number]

/** 全角数字と全角チルダを半角に寄せて、以降の正規表現を半角だけで書けるようにする */
const normalize = (value: string): string =>
  value
    .replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[～〜]/g, '~')
    .trim()

/**
 * 範囲の下限側の表記を歳に直す。
 * `産休明け` と `Nか月` は 0 歳児クラスを指すのでいずれも 0 とみなす。
 */
const parseLowerAge = (value: string): number | null => {
  if (value.includes('産休明け') || /\d+\s*か月/.test(value)) return 0

  const matched = value.match(/(\d+)\s*歳/)

  return matched?.[1] ? Number(matched[1]) : null
}

/** 範囲の上限側の表記を歳に直す。`就学前` は 5 歳まで受け入れる意味で扱う */
const parseUpperAge = (value: string): number | null => {
  if (value.includes('就学前')) return MAX_AGE

  const matched = value.match(/(\d+)\s*歳/)

  return matched?.[1] ? Number(matched[1]) : null
}

/**
 * `childcare_age` を、受け入れる年齢の一覧に変換する。
 *
 * @example parseChildcareAges('１歳～５歳') // [1, 2, 3, 4, 5]
 * @example parseChildcareAges('産休明け～２歳') // [0, 1, 2]
 * @example parseChildcareAges('３・４・５歳児') // [3, 4, 5]
 * @returns 解釈できなかった場合は null
 */
export const parseChildcareAges = (childcareAge: string | null | undefined): number[] | null => {
  if (!childcareAge) return null

  const normalized = normalize(childcareAge)

  const ages: number[] = []

  if (normalized.includes('~')) {
    const [lower, upper] = normalized.split('~')
    const from = parseLowerAge(lower ?? '')
    const to = parseUpperAge(upper ?? '')

    if (from === null || to === null || from > to) return null

    for (let age = from; age <= Math.min(to, MAX_AGE); age++) {
      ages.push(age)
    }
  } else {
    // `３・４・５歳児` `１・２歳` のような列挙形式。単一の `３歳` もここで拾える
    for (const matched of normalized.matchAll(/(\d+)/g)) {
      const age = Number(matched[1])

      if (age <= MAX_AGE) ages.push(age)
    }
  }

  return ages.length > 0 ? ages : null
}

/**
 * `available_day` を、開所している曜日の一覧に変換する。
 *
 * @example parseAvailableDays('月～土') // ['月', '火', '水', '木', '金', '土']
 * @returns 解釈できなかった場合は null
 */
export const parseAvailableDays = (availableDay: string | null | undefined): Weekday[] | null => {
  if (!availableDay) return null

  const normalized = normalize(availableDay)

  if (normalized.includes('~')) {
    const [lower, upper] = normalized.split('~')
    const from = WEEKDAYS.indexOf((lower ?? '').trim() as Weekday)
    const to = WEEKDAYS.indexOf((upper ?? '').trim() as Weekday)

    if (from < 0 || to < 0 || from > to) return null

    return WEEKDAYS.slice(from, to + 1)
  }

  const days = WEEKDAYS.filter(weekday => normalized.includes(weekday))

  return days.length > 0 ? days : null
}

/** 年齢スケールの目盛り。0〜5 歳を常に並べ、受け入れる年齢だけを塗る */
export const AGE_SCALE = Array.from({ length: MAX_AGE + 1 }, (_, age) => age)
