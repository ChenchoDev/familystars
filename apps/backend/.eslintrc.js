export default {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
      },
    ],
    'no-console': 'off',
    'consistent-return': 'off',
  },
};
