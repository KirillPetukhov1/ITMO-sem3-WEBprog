import stylistic from '@stylistic/eslint-plugin'

const arrowFunction = {
  selector: 'VariableDeclaration:has(> VariableDeclarator > ArrowFunctionExpression)',
}

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: arrowFunction },
        { blankLine: 'always', prev: arrowFunction, next: '*' },
        { blankLine: 'always', prev: '*', next: 'export' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'block-like', next: ['const', 'let', 'var'] },
        {
            blankLine: 'always',
            prev: { selector: 'ExportNamedDeclaration:has(> ClassDeclaration)' },
            next: ['const', 'let', 'var'],
        },
      ],
    },
  },
]