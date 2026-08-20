import type { INursery } from '~~/server/types/nursery'

/**
 * meta description の組み立て (#151)。
 *
 * 詳細ページは119件あるので、全件で同じ文言にならないよう施設ごとの値から作る。
 * 検索結果に出るのは概ね120字前後までなので、上限を意識して要素を絞っている。
 *
 * 実在しない情報は書かない。`shuttle_bus` の null は「不明」であって「無し」ではないため、
 * true のときだけ触れる。`is_temporary_care` も同様に true のときだけ書く。
 */

/**
 * 住所から大字だけを取り出す。
 *
 * @example extractOaza('つくば市上横場354番地10') // '上横場'
 * @returns 取り出せない場合は空文字
 */
const extractOaza = (address: string | null | undefined): string =>
  (address ?? '')
    .replace(/^つくば市/, '')
    .replace(/[0-9０-９].*$/, '')
    .trim()

export const buildNurseryDescription = (nursery: INursery): string => {
  const oaza = extractOaza(nursery.address)
  const place = oaza ? `つくば市${oaza}` : 'つくば市'

  const facts: string[] = []

  if (nursery.capacity) facts.push(`定員${nursery.capacity}人`)
  if (nursery.childcare_age) facts.push(`受入年齢は${nursery.childcare_age}`)
  if (nursery.open_weekday && nursery.close_weekday) {
    facts.push(`平日${nursery.open_weekday}〜${nursery.close_weekday}開所`)
  }
  if (nursery.is_temporary_care) facts.push('一時預かりあり')
  if (nursery.shuttle_bus) facts.push('送迎バスあり')

  const head = `${nursery.name}（${place}）は、${nursery.area}エリアにある${nursery.classification}の認可${nursery.type}です。`

  return `${head}${facts.join('、')}。所在地・地図・開所時間などをまとめています。`
}
