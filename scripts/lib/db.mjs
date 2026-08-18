// 接続先DBの解決と、本番DBへの誤書き込みの防止
//
// MONGODB_URI は DB名を含まない形（mongodb+srv://.../?retryWrites=...）で持ち、
// 接続先は MONGODB_DB で切り替える。
// - dev/prod の切り替えが、秘密情報を含まない1変数の変更で済む
// - mongodump / mongorestore は DB名を含まない URI を要求するため、そのまま渡せる
//
// 開発用DB（kosodate_dev）と本番DB（kosodate）は同じクラスタに同居している。
// 事故を防ぐため、書き込む前に必ず assertWritable() を通す。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')

const readFromEnvFile = (key) => {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return null
  const line = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).replace(/^["']|["']$/g, '').trim() : null
}

// 環境変数が .env より優先される。本番を対象にするときは実行時に頭で渡す
const readEnv = key => process.env[key] || readFromEnvFile(key)

export const resolveUri = () => {
  const uri = readEnv('MONGODB_URI')
  if (!uri) throw new Error('MONGODB_URI が見つかりません（.env を確認してください）')

  const dbName = readEnv('MONGODB_DB')
  if (!dbName) throw new Error('MONGODB_DB が見つかりません（接続先のデータベース名を指定してください）')

  console.log(`接続先DB: ${dbName} （${process.env.MONGODB_DB ? '環境変数' : '.env'} から取得）`)

  return { uri, dbName }
}

// 開発用DB以外に書き込む場合は --prod を要求する
export const assertWritable = (dbName, args) => {
  if (dbName.endsWith('_dev')) return
  if (args.includes('--prod')) {
    console.log('⚠ 本番DBに書き込みます（--prod 指定あり）')
    return
  }
  throw new Error(
    `書き込み先が開発用DBではありません（${dbName}）。`
    + '本番DBを対象にする場合は --prod を付けてください。',
  )
}
