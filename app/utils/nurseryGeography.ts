import type { INursery } from '~~/server/types/nursery'

/**
 * エリア別・地区別ページに置く地理情報 (#178)。
 *
 * 集計テキスト（`nurserySummary`）だけだと、どのページも同じ項目に数字が入れ替わって
 * 並ぶだけで、区分ごとの違いが出ない。実際 Search Console でも多くのエリアページが
 * 「検出 - インデックス未登録」になっていた。
 *
 * ここで足すのは**掲載データの緯度経度から計算しただけの値**で、地域の紹介文は書かない。
 * 施設の座標はつくば市のオープンデータに全件入っているので、外部APIは呼ばない。
 *
 * 距離はすべて直線距離。道のりでも徒歩分数でもない。経路距離は Directions API が要り
 * 課金が発生するうえ、「駅から徒歩◯分」は手元のデータから言えることを超える。
 * 呼び出し側で直線距離であることを必ず断ること。
 */

/**
 * つくばエクスプレスのうち、つくば市内にある4駅。
 *
 * 座標は OpenStreetMap の駅ノード（2026-08-25 時点）。駅は動かないので静的に持つ。
 * みらい平・守谷は市外なので入れない。
 *
 * 並びは北から南。最寄り駅の件数が同数で並んだときの順序を安定させるために使う。
 */
export const TX_STATIONS: Array<{ name: string, latitude: number, longitude: number }> = [
  { name: 'つくば駅', latitude: 36.0826496, longitude: 140.1111943 },
  { name: '研究学園駅', latitude: 36.0824471, longitude: 140.0831024 },
  { name: '万博記念公園駅', latitude: 36.0583974, longitude: 140.0592068 },
  { name: 'みどりの駅', latitude: 36.0301214, longitude: 140.0559828 },
]

/** 市の中心部として距離の基準にする駅。つくば市役所ではなく駅を採るのは、生活の起点になるため */
const CENTER_STATION = TX_STATIONS[0]!

export interface NurseryGeography {
  /** 距離を計算できた施設の数。0 のときは他の値を出さない */
  located: number
  /** 最寄りのTX駅ごとの施設数。多い順、同数なら北から */
  nearestStations: Array<{ name: string, count: number }>
  /** 最寄り駅がいちばん近い施設の直線距離(km) */
  toStationMin: number
  /** 最寄り駅がいちばん遠い施設の直線距離(km) */
  toStationMax: number
  /** つくば駅からいちばん近い施設の直線距離(km) */
  fromCenterMin: number
  /** つくば駅からいちばん遠い施設の直線距離(km) */
  fromCenterMax: number
  /** いちばん離れた2施設の直線距離(km)。施設が1つなら 0 */
  spread: number
}

/** 緯度経度が入っている施設だけを返す。取り込み漏れがあっても 0,0 を赤道上の点として扱わない */
const located = (nurseries: INursery[]) =>
  nurseries.filter(nursery => Number.isFinite(nursery.latitude) && Number.isFinite(nursery.longitude)
    && nursery.latitude !== 0 && nursery.longitude !== 0)

export const buildNurseryGeography = (nurseries: INursery[]): NurseryGeography => {
  const points = located(nurseries)

  if (points.length === 0) {
    return { located: 0, nearestStations: [], toStationMin: 0, toStationMax: 0, fromCenterMin: 0, fromCenterMax: 0, spread: 0 }
  }

  const counts = new Map<string, number>()
  const distancesToStation: number[] = []
  const distancesFromCenter: number[] = []

  for (const point of points) {
    const nearest = TX_STATIONS.reduce((closest, station) =>
      distanceInKm(point, station) < distanceInKm(point, closest) ? station : closest,
    )

    counts.set(nearest.name, (counts.get(nearest.name) ?? 0) + 1)
    distancesToStation.push(distanceInKm(point, nearest))
    distancesFromCenter.push(distanceInKm(point, CENTER_STATION))
  }

  // 同数のときは TX_STATIONS の並び（北から南）で決める。Map の挿入順だと施設の並びに左右される
  const order = new Map(TX_STATIONS.map((station, index) => [station.name, index]))
  const nearestStations = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || order.get(a.name)! - order.get(b.name)!)

  let spread = 0

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      spread = Math.max(spread, distanceInKm(points[i]!, points[j]!))
    }
  }

  return {
    located: points.length,
    nearestStations,
    toStationMin: Math.min(...distancesToStation),
    toStationMax: Math.max(...distancesToStation),
    fromCenterMin: Math.min(...distancesFromCenter),
    fromCenterMax: Math.max(...distancesFromCenter),
    spread,
  }
}

/** 「みどりの駅8園・万博記念公園駅3園」の形に整える */
export const formatNearestStations = (stations: Array<{ name: string, count: number }>): string =>
  stations.map(station => `${station.name}${station.count}園`).join('・')
