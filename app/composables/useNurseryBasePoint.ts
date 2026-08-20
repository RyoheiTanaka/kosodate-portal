import type { INursery } from '~~/server/types/nursery'
import type { Coordinates } from '~/utils/geo'
import oazaLatLng from '~/data/oaza-latlng.json'

/**
 * 距離順ソートの基準点 (#87)。
 *
 * 取り方は2つ。どちらも外部APIを使わないため、GCP の操作も費用も発生しない。
 *
 * - A: Geolocation API（ブラウザの位置情報）
 * - B: 大字を選ぶ（Aが使えないときのフォールバック）
 *
 * 住所の自由入力（Geocoding API）は課金とキー管理が要り、入力された住所を外部へ
 * 送ることにもなるため採用しない (#139)。大字の代表点を静的に持てば、実行時の
 * 外部API呼び出しゼロで市内の全大字を基準にできる。番地レベルの精度は出せないので、
 * 「おおよその距離」であることを画面で断り、正確な道のりは Google マップへ送る。
 *
 * ## プライバシー
 *
 * 取得した座標はブラウザの中だけで使い、サーバーへ送信も保存もしない。
 * URLにも載せない。`?from=36.08,140.11` の形で載せると共有した相手に自宅が伝わるため。
 * この方針は /privacy にも書いてある。
 *
 * ## 状態を useState で持つ理由
 *
 * カード1枚ごとに距離を出すため、NurseryCard からも基準点が要る。
 * props で配ると NurseryCardList を経由して全カードに配ることになるので、
 * ページ間で共有される1つの状態として持つ。
 */

export type BasePointSource = 'geolocation' | 'oaza'

export interface BasePoint extends Coordinates {
  /** 「現在地」または大字名。何を基準に並べているかを画面に出すために持つ */
  label: string
  source: BasePointSource
}

/**
 * 位置情報の取得状況。
 *
 * - `idle`        まだ試していない
 * - `loading`     許可ダイアログを出している、または取得中
 * - `granted`     取得できた
 * - `denied`      利用者が拒否した
 * - `unsupported` ブラウザが対応していない、または安全なコンテキストでない
 * - `error`       拒否ではないが取得に失敗した（測位できないなど）
 *
 * `denied` と `error` を分けているのは、画面に出す文言が変わるため。
 * 拒否は利用者の判断なので、失敗として扱わない。
 */
export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported' | 'error'

export const useNurseryBasePoint = () => {
  const basePoint = useState<BasePoint | null>('nursery-base-point', () => null)
  const geolocationStatus = useState<GeolocationStatus>('nursery-geolocation-status', () => 'idle')

  /**
   * 大字の選択肢。つくば市の全大字を、代表点の座標つきで並べる (#139)。
   *
   * 基本は国土交通省の位置参照情報（大字・町丁目レベル）の代表点で、
   * scripts/build-oaza-latlng.mjs が app/data/oaza-latlng.json に落としている。
   *
   * 以前は「その大字にある保育所の重心」だけを代表点にしていたため、保育所が0件の
   * 大字は選択肢に出せなかった（71件）。自宅の大字が無ければ隣を選ぶしかなく、
   * そこが #139 の発端。静的な代表点を持つことで市内のどの大字でも基準にできる。
   *
   * ただし区画整理後の新しい町名（さくらの森・要元中根・流星台）は位置参照情報に
   * まだ無い。そこだけは従来どおり保育所の重心で補う。静的データがある大字では
   * 重心を使わない。重心は園の分布に引きずられるため、代表点のほうが素直。
   */
  const buildOazaOptions = (nurseries: INursery[] | null | undefined) => {
    const options = new Map<string, Coordinates>(
      Object.entries(oazaLatLng).map(([oaza, point]) => [oaza, point]),
    )

    const groups = new Map<string, { latitude: number, longitude: number, count: number }>()

    for (const nursery of nurseries ?? []) {
      const oaza = toOaza(nursery.address)
      if (!oaza || options.has(oaza)) continue

      const current = groups.get(oaza) ?? { latitude: 0, longitude: 0, count: 0 }
      current.latitude += nursery.latitude
      current.longitude += nursery.longitude
      current.count += 1
      groups.set(oaza, current)
    }

    for (const [oaza, sum] of groups) {
      options.set(oaza, { latitude: sum.latitude / sum.count, longitude: sum.longitude / sum.count })
    }

    return [...options.entries()]
      .map(([oaza, point]) => ({
        label: oaza,
        value: oaza,
        latitude: point.latitude,
        longitude: point.longitude,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja'))
  }

  /**
   * 現在地を取得する。
   *
   * Geolocation API は安全なコンテキスト（HTTPS）でのみ動く。
   * localhost は例外として許可されるので開発時は問題なく、本番の Vercel は元々 HTTPS。
   */
  const requestGeolocation = () => {
    if (import.meta.server) return

    if (!navigator.geolocation) {
      geolocationStatus.value = 'unsupported'
      return
    }

    geolocationStatus.value = 'loading'

    navigator.geolocation.getCurrentPosition(
      (position) => {
        basePoint.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: '現在地',
          source: 'geolocation',
        }
        geolocationStatus.value = 'granted'
      },
      (error) => {
        // PERMISSION_DENIED は利用者の判断なので、失敗ではなく拒否として扱う
        geolocationStatus.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'error'
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    )
  }

  const setOaza = (option: { label: string, latitude: number, longitude: number }) => {
    basePoint.value = {
      latitude: option.latitude,
      longitude: option.longitude,
      label: option.label,
      source: 'oaza',
    }
  }

  const clear = () => {
    basePoint.value = null
    geolocationStatus.value = 'idle'
  }

  return { basePoint, geolocationStatus, buildOazaOptions, requestGeolocation, setOaza, clear }
}
