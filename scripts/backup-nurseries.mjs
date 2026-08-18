// nurseries コレクションのバックアップ／復元
//
//   node scripts/backup-nurseries.mjs                       バックアップを作成
//   node scripts/backup-nurseries.mjs --list                バックアップ一覧
//   node scripts/backup-nurseries.mjs --restore=<ファイル>   復元（全件置き換え）
//
// 復元先が開発用DB（_dev で終わる名前）でない場合は --prod が必要。
//
// mongodump が使える環境ではそちらを推奨（インデックスやBSON型もそのまま保存できる）。
// このスクリプトは追加インストールなしで使える簡易版。
import fs from 'node:fs'
import path from 'node:path'
import dns from 'node:dns'
import mongoose from 'mongoose'
import { assertWritable, resolveUri } from './lib/db.mjs'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const ROOT = path.resolve(import.meta.dirname, '..')
const BACKUP_DIR = path.join(ROOT, 'backups')
const args = process.argv.slice(2)
const getOpt = (name) => {
  const hit = args.find(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return null
  return hit.includes('=') ? hit.slice(name.length + 3) : true
}

const list = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('バックアップはまだありません')
    return
  }
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
  if (!files.length) {
    console.log('バックアップはまだありません')
    return
  }
  for (const f of files) {
    const p = path.join(BACKUP_DIR, f)
    const count = JSON.parse(fs.readFileSync(p, 'utf8')).length
    console.log(`  ${f}  (${count}件, ${(fs.statSync(p).size / 1024).toFixed(1)}KB)`)
  }
}

const main = async () => {
  if (getOpt('list')) {
    list()
    return
  }

  const { uri, dbName } = resolveUri()
  // バックアップの作成は読むだけ。復元は全件置き換えなので書き込み扱いにする
  if (getOpt('restore')) assertWritable(dbName, args)

  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 20000 })
  const col = mongoose.connection.db.collection('nurseries')

  const restoreFrom = getOpt('restore')
  if (restoreFrom) {
    const file = path.isAbsolute(restoreFrom) ? restoreFrom : path.resolve(ROOT, restoreFrom)
    if (!fs.existsSync(file)) throw new Error(`ファイルが見つかりません: ${file}`)
    const docs = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(docs) || !docs.length) throw new Error('バックアップの中身が空です')

    const current = await col.countDocuments()
    console.log(`復元: ${path.relative(ROOT, file)} (${docs.length}件)`)
    console.log(`現在のコレクション: ${current}件 → 全件削除して置き換えます`)

    await col.deleteMany({})
    await col.insertMany(docs.map(d => ({ ...d, _id: new mongoose.Types.ObjectId(d._id) })))
    console.log(`復元完了: ${await col.countDocuments()}件`)
    await mongoose.disconnect()
    return
  }

  const docs = await col.find({}).toArray()
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-')
  const dest = path.join(BACKUP_DIR, `nurseries-${stamp}.json`)
  fs.writeFileSync(dest, JSON.stringify(docs, null, 2))
  console.log(`バックアップ作成: ${path.relative(ROOT, dest)} (${docs.length}件)`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('ERROR:', e.message)
  process.exitCode = 1
})
