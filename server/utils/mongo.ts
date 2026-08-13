import dns from 'node:dns'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxt_app'

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

  await mongoose.connect(MONGO_URI)

  return mongoose.connection
}
