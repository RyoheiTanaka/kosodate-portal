import dns from 'node:dns'
import mongoose from 'mongoose'

// MONGODB_URI は DB名を含まない。接続先は MONGODB_DB で切り替える
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
// 本番で未設定のまま開発用DBにフォールバックすると、気づかないまま別DBを向く。
// 既定値は開発時のみ。本番は明示を必須にする。
const MONGO_DB = process.env.MONGODB_DB || (import.meta.dev ? 'kosodate_dev' : '')

// mongodb+srv:// は接続時にSRVレコードを引く。
// ルーターやISPのDNSがSRVクエリを拒否する環境では querySrv ECONNREFUSED になるため、
// 開発時のみ公開DNSを使う。本番（Vercel）はDNSが正常なのでこの回避は不要。
if (import.meta.dev) {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
}

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // dbName に undefined を渡すと URI 側の指定（無ければ test）に落ちて 0 件になる。
  // 黙って別DBを向くより、接続前に止めたほうが原因が分かる。
  if (!MONGO_DB) {
    throw new Error('MONGODB_DB が設定されていません（接続先のデータベース名を指定してください）')
  }

  // 本番の接続ユーザーは kosodate への read のみを持つ。
  // mongoose は既定でモデル定義からインデックスを作りにいくため、そのままだと
  // 起動時に not authorized になる。インデックスは開発側で作られたものが複製済み。
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB, autoIndex: import.meta.dev })

  return mongoose.connection
}
