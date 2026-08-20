import type { INursery } from '~~/server/types/nursery'

/**
 * 施設詳細の構造化データ (#151)。
 *
 * `ChildCare` は `LocalBusiness` のサブタイプで、住所・電話・開所時間をそのまま持てる。
 *
 * **実在しない情報は絶対に足さないこと。** 評価・料金・レビューは持っていないので出さない。
 * 不正確な構造化データは手動対策の対象になる。
 */

/** schema.org の dayOfWeek 表記。DBの `available_day` は `月～土` の形で入っている */
const DAY_OF_WEEK: Record<Weekday, string> = {
  月: 'Monday',
  火: 'Tuesday',
  水: 'Wednesday',
  木: 'Thursday',
  金: 'Friday',
  土: 'Saturday',
  日: 'Sunday',
}

/** `7:30` を `07:30` に整える。schema.org の時刻は HH:MM を期待する */
const toIsoTime = (value: string | null | undefined): string | null => {
  const matched = String(value ?? '').match(/^(\d{1,2}):(\d{2})$/)

  if (!matched) return null

  return `${matched[1]!.padStart(2, '0')}:${matched[2]}`
}

/**
 * 開所時間。平日と土曜で時刻が違うので2つに分ける。
 *
 * 土曜は `open_saturday` が `なし` の施設があり（`available_day` も `月～金`）、
 * その場合は土曜の枠自体を出さない。空文字ではなく `なし` という文字列で
 * 入っている点に注意。
 */
const buildOpeningHours = (nursery: INursery) => {
  const days = parseAvailableDays(nursery.available_day)

  if (!days) return []

  const specs: Array<Record<string, unknown>> = []

  const weekdays = days.filter(day => day !== '土' && day !== '日')
  const weekdayOpens = toIsoTime(nursery.open_weekday)
  const weekdayCloses = toIsoTime(nursery.close_weekday)

  if (weekdays.length > 0 && weekdayOpens && weekdayCloses) {
    specs.push({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': weekdays.map(day => DAY_OF_WEEK[day]),
      'opens': weekdayOpens,
      'closes': weekdayCloses,
    })
  }

  const saturdayOpens = toIsoTime(nursery.open_saturday)
  const saturdayCloses = toIsoTime(nursery.close_saturday)

  if (days.includes('土') && saturdayOpens && saturdayCloses) {
    specs.push({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Saturday'],
      'opens': saturdayOpens,
      'closes': saturdayCloses,
    })
  }

  return specs
}

/**
 * 住所を PostalAddress に分解する。
 *
 * DB は `つくば市上横場354番地10` のようにフル住所で持っている (#84)。
 * 市名は固定なので addressLocality に出し、残りを streetAddress にする。
 * 方書（`address_note`）があれば street 側に足す。
 */
const buildAddress = (nursery: INursery) => {
  const street = `${(nursery.address ?? '').replace(/^つくば市/, '')}${nursery.address_note ? ` ${nursery.address_note}` : ''}`.trim()

  return {
    '@type': 'PostalAddress',
    'streetAddress': street,
    'addressLocality': 'つくば市',
    'addressRegion': '茨城県',
    'addressCountry': 'JP',
  }
}

export const buildNurserySchema = (nursery: INursery, url: string): Record<string, unknown> => {
  const openingHours = buildOpeningHours(nursery)

  return {
    /*
     * defineLocalBusiness は使わない。あちらはサイトの identity ノードを名乗るため、
     * nuxt.config で定義したサイト運営主体の Organization を施設で上書きしてしまう。
     * 施設は独立したノードとして出す。
     */
    '@type': 'ChildCare',
    '@id': `${url}#nursery`,
    'name': nursery.name,
    'url': url,
    'address': buildAddress(nursery),
    ...(nursery.tel ? { telephone: nursery.tel } : {}),
    ...(nursery.latitude && nursery.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            'latitude': nursery.latitude,
            'longitude': nursery.longitude,
          },
        }
      : {}),
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
    /*
     * 運営法人。公立は市が運営しているため空のことがある（119件中89件が空）。
     * 無いものを「つくば市」で補わない。データにある値だけを出す。
     */
    ...(nursery.corporate_name
      ? {
          parentOrganization: {
            '@type': 'Organization',
            'name': nursery.corporate_name,
          },
        }
      : {}),
  }
}
