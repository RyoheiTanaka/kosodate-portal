// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Header / Footer など単語ひとつの汎用名を許容する（旧 .eslintrc から引き継ぎ）
    'vue/multi-word-component-names': 'off',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'vue/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
})
