// @ts-check
import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.vue'],
    rules: {
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  stylistic.configs.customize({
    flat: true,
    indent: 2,
    quotes: 'single',
    semi: false,
  }),
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'no-control-regex': 'off',
    },
  },
)
