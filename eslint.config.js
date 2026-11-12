import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// Vue's compiler only treats an inline v-on handler as multiple statements if it contains ';'.
// Prettier (semi: false) strips those, so newline-separated statements break `vite build`.
const noMultilineInlineHandler = {
  meta: {
    type: 'problem',
    messages: {
      multi:
        'Multiple statements in an inline event handler fail to compile in production. Wrap them in "() => { ... }".',
    },
  },
  create(context) {
    return context.sourceCode.parserServices.defineTemplateBodyVisitor({
      VOnExpression(node) {
        if (node.body.length > 1 && !context.sourceCode.getText(node).includes(';')) {
          context.report({ node, messageId: 'multi' })
        }
      },
    })
  },
}

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    name: 'app/type-imports',
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  {
    name: 'app/vue-handlers',
    files: ['**/*.vue'],
    plugins: { app: { rules: { 'no-multiline-inline-handler': noMultilineInlineHandler } } },
    rules: { 'app/no-multiline-inline-handler': 'error' },
  },

  skipFormatting,
]
