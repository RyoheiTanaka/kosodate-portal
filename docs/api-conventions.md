# サーバー API の書き方

エンドポイントごとに書き方がばらついていたため、方針を決めた（#88 の項目4）。
新しいエンドポイントを足すときはこれに従う。

## 1. 読み取りは `.lean()` を使う

Mongoose ドキュメントのインスタンスメソッドは使っていないので、素のオブジェクトを取り出す。
ドキュメントを組み立てないぶん速く、返り値の型も素直になる。

```ts
const nurseries = await Nursery.find(filter).lean()
```

## 2. `_id` は文字列にして返す

JSON 化の時点でどのみち文字列になるが、型の上で `Types.ObjectId` のままだと
クライアント側の型と食い違う。変換は `serializeNursery()` に集約する。

```ts
return nurseries.map(serializeNursery)
```

`INursery`（`server/types/nursery.ts`）は **API が返す形** を表す。
DB 側のドキュメント型は `server/models/Nursery.ts` の `INurseryDocument`。

## 3. エラーは `createError` で投げる

ステータスコードを本文に入れて 200 で返さない。HTTP のステータスで表す。

```ts
throw createError({ statusCode: 400, statusMessage: 'Invalid ID', message: 'IDが不正です' })
```

- `statusMessage` は英語の識別子。ログや開発時の判別用
- `message` は画面にそのまま出す日本語。クライアントは `error.data.message` で受け取る
- 500 系は Nitro が `message` を伏せるので、画面向けの文言はクライアント側で用意する

## 4. パラメータは使う前に検証する

`event.context.params` は文字列なので、数値カラムに渡す前に変換して確かめる。
Mongoose のキャストに任せると `CastError` が 500 になって出る。

```ts
const nurseryId = Number(event.context.params?.id)

if (!Number.isInteger(nurseryId)) {
  throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
}
```

## 5. ハンドラに返り値の型を書く

`defineEventHandler(async (event): Promise<INursery[]> => {` のように書く。
返す形を変えたときにクライアント側の型とずれたことに気づける。
