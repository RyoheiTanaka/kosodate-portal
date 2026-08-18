import dns from 'node:dns'
import mongoose from 'mongoose'

// MONGODB_URI は DB名を含まない。接続先は MONGODB_DB で切り替える
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGO_DB = process.env.MONGODB_DB || 'kosodate_dev'

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

  // 本番の接続ユーザーは kosodate への read のみを持つ。
  // mongoose は既定でモデル定義からインデックスを作りにいくため、そのままだと
  // 起動時に not authorized になる。インデックスは開発側で作られたものが複製済み。
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB, autoIndex: import.meta.dev })

  return mongoose.connection
}
