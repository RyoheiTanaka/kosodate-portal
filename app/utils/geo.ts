/**
 * 距離の計算と表示 (#87)。
 *
 * 保育所の緯度経度はつくば市のオープンデータに全件含まれているため、
 * 必要なのは利用者側の基準点だけ。保育所のジオコーディングは行わない。
 */

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * 2点間の直線距離をkmで返す（Haversine）。
 *
 * 道のりではなく直線距離。送迎の実際の所要時間とは別物なので、
 * 表示側で「直線距離」であることを断る必要がある。
 * 経路距離は Directions API が要り課金が発生するため、ここでは扱わない。
 */
export const distanceInKm = (from: Coordinates, to: Coordinates): number => {
  const dLat = toRadians(to.latitude - from.latitude)
  const dLng = toRadians(to.longitude - from.longitude)

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/**
 * 距離を読める形にする。
 *
 * 1km未満はmで出す。「約0.8km」より「約800m」のほうが距離感が掴みやすい。
 * 10km以上は小数を落とす。つくば市内でその距離になると、100m単位の精度に意味が無い。
 */
export const formatDistance = (km: number): string => {
  if (km < 1) return `約${Math.round(km * 1000 / 10) * 10}m`
  if (km < 10) return `約${km.toFixed(1)}km`

  return `約${Math.round(km)}km`
}

/**
 * 住所から大字を切り出す。「茨城県つくば市島名2711番地1」→「島名」
 *
 * scripts/import-nurseries.mjs にも同じ処理がある。
 * あちらは素の Node から動かすため .mjs で、こちらから import できない。
 * 片方を直したらもう片方も直すこと。
 */
export const toOaza = (address: string): string =>
  String(address)
    .replace(/^茨城県?/, '')
    .replace(/^つくば市/, '')
    .replace(/[0-9０-９].*$/, '')
    .replace(/(丁目|番地|字).*$/, '')
    .trim()
