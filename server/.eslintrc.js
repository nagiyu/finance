/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Common rules (consistent with root)
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    // Server-specific overrides
    'no-console': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '*.js', '!.eslintrc.js'],
};
