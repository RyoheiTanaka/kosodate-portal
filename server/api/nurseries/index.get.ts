import { Nursery } from '~~/server/models/Nursery'
import type { INursery } from '~~/server/types/nursery'

/*
 * 認可保育所の一覧。常に全件（閉園を除く）を返す。
 *
 * 以前は `?keyword=` で MongoDB の正規表現検索を行っていたが、#106 で絞り込みを
 * クライアント側に一本化したため削除した。削除時点で呼び出し元は無い
 * （一覧・エリア一覧・エリア別ページはすべて useNurseries() 経由で全件を取る）。
 *
 * サーバー検索を戻すのは、件数が桁で増えて全件をクライアントに載せられなくなったとき、
 * または #120 で Atlas Search に切り替えるとき。どちらも設計ごと決め直すことになるので、
 * 中途半端に残しておくより消しておくほうがよい。
 */
export default defineEventHandler(async (): Promise<INursery[]> => {
  await connectDB()

  // 閉園した施設は一覧に含めない（詳細ページはURL維持のため残す）
  const nurseries = await Nursery.find({ is_active: { $ne: false } }).lean()

  return nurseries.map(serializeNursery)
})
