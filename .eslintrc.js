module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: ['@geolonia'],
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
  },
};
