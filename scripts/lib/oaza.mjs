// 住所から大字を切り出して、エリア・地区・郵便番号を引く。
//
// 認可保育所（scripts/import-nurseries.mjs）と、それ以外の施設
// （scripts/import-facilities.mjs）の両方が使う。取り込み対象が増えても
// 大字の解釈は1か所に置いておきたいので、ここに集約している。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/data', name), 'utf8'))

const AREA_MAP = load('oaza-area.json')
const DISTRICT_MAP = load('oaza-district.json')
const POSTAL_MAP = load('oaza-postal.json')

/**
 * 住所から大字を切り出す。「茨城県つくば市島名2711番地1」→「島名」
 * エリア・地区・郵便番号のいずれもこのキーで引く。
 */
export const toOaza = s => String(s).replace(/^茨城県?/, '').replace(/^つくば市/, '')
  .replace(/[0-9０-９].*$/, '').replace(/(丁目|番地|字).*$/, '').trim()

/**
 * エリア (#86)。市の公式区分ではなく、TXの駅と生活圏で切り直したこのサイト独自の軸。
 * 対応表は scripts/data/oaza-area.json。
 */
export const toArea = (address) => {
  const hit = AREA_MAP[toOaza(address)]
  return { area: hit?.name ?? '', area_alphabet: hit?.alphabet ?? '' }
}

/** 市の公式区分（6地区）。大字マップの取りこぼしを検知するために使う */
export const toDistrict = (address) => {
  const hit = DISTRICT_MAP[toOaza(address)]
  return { district: hit?.name ?? '', district_alphabet: hit?.alphabet ?? '' }
}

/**
 * 郵便番号 (#151)。市のデータに列が無く、日本郵便のデータから大字で引いている。
 * 一意に決められない大字は空のまま返す。推測で埋めない。
 */
export const toPostalCode = address => POSTAL_MAP[toOaza(address)] ?? ''
