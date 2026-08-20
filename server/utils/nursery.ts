import type { Types } from 'mongoose'
import type { INursery } from '~~/server/types/nursery'

/** `.lean()` で取り出した保育所ドキュメント。`_id` だけ ObjectId のまま残る */
type LeanNursery = Omit<INursery, '_id'> & { _id: Types.ObjectId }

/**
 * DB から取り出した形を API が返す形に揃える。
 *
 * JSON 化すればどのみち文字列になるが、型の上でも `_id: string` にしておかないと
 * クライアント側と食い違う。変換をここ1箇所に置いて、全エンドポイントで通す。
 */
export const serializeNursery = (nursery: LeanNursery): INursery => ({
  ...nursery,
  _id: nursery._id.toString(),
})
