/**
 * title の整形。`〇〇 - 子育てポータル` に揃える。
 *
 * app.vue と error.vue の2箇所から使う。エラーページは app.vue ごと差し替わるため
 * app.vue の titleTemplate が効かず、同じ整形を自前で当てる必要がある。
 * 片方だけ書式が変わるのを防ぐためにここへ出している。
 */
export const titleTemplate = (titleChunk?: string): string =>
  titleChunk ? `${titleChunk} - 子育てポータル` : '子育てポータル'
