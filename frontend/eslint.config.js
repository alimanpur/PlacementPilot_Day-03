import globals from 'globals'

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|toast|[A-Z])', argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
]
