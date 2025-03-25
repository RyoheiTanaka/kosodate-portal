// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'vue/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
})
