/**
 * CSRFトークンの発行 (#151)。
 *
 * 閲覧系ページは routeRules で csurf を切っており、cookie（＝トークンの元になる秘密）が
 * 発行されない。そのままだと一覧からクライアント遷移で問い合わせページへ来た利用者は
 * 送信時に 403 になるので、送信の直前にここを叩いて cookie とトークンを揃える。
 *
 * このリクエスト自体には csurf が効いている（routeRules に書いていないため）ので、
 * nuxt-csurf のプラグインが cookie を発行し、event.context にトークンを載せている。
 */
export default defineEventHandler((event) => {
  const token = event.context.csrfToken

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'CSRF token unavailable', message: 'トークンを発行できませんでした' })
  }

  return { token }
})
