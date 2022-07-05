module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 8,
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:import/errors', 'plugin:import/warnings', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        bracketSpacing: false,
        semi: false,
        printWidth: 120,
      },
    ],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'no-console': 0,
  },
  globals: {
    io: true,
  },
}
