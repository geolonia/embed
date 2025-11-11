module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:editorconfig/all',
    'plugin:promise/recommended',
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
    es2024: true,
  },
  plugins: ['editorconfig', 'import', 'promise'],
  rules: {
    'array-callback-return': 'error',
    'arrow-parens': 'error',
    'arrow-spacing': 'error',
    'block-spacing': 'error',
    //   indent: ['error', 2], // NOTE: Follow editorconfig
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'generator-star-spacing': 'error',
    'no-console': 'warn',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'rest-spread-spacing': 'error',
    'semi-spacing': 'error',
    'sort-imports': 'off',
    'space-before-blocks': 'error',
    'template-curly-spacing': 'error',
    'yield-star-spacing': 'error',
    yoda: ['error', 'never', { exceptRange: true }],

    'import/no-extraneous-dependencies': ['warn', {
      'devDependencies': [
        '**/.eslintrc.js',
        '**/.eslintrc.cjs',
        '**/.mocharc.js',
        '**/.prettierrc.js',
        '**/jest.config.js',
        '**/next.config.js',
        '**/vite.config.js',
        '**/vite.config.ts',
        '**/webpack.config.js',
      ],
    }],
    'promise/prefer-await-to-then': 'error',
  },
  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs', '*.jsx'],
      rules: {
        'comma-dangle': ['error', 'always-multiline'],
        'comma-spacing': ['error', { before: false, after: true }],
        'no-duplicate-imports': 'error',
        'no-useless-constructor': 'error',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],

        'no-loss-of-precision': 'off',
      },
    },
    {
      files: [ '*.cjs' ],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: [ '*.mjs', '*.jsx' ],
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': [
          'off',
          { 'ts-ignore': true },
        ],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/comma-spacing': ['error', { before: false, after: true }],
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/semi': ['error', 'always'],

        '@typescript-eslint/no-misused-promises': [ 'warn', { 'checksConditionals': true, 'checksVoidReturn': false }],

        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-extra-semi': 'off',
        '@typescript-eslint/no-loss-of-precision': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      env: {
        browser: true,
      },
      plugins: ['react', 'react-hooks'],
      settings: {
        react: {
          pragma: 'React',
          version: 'detect',
        },
      },
      rules: {
        'react/jsx-uses-react': 'off', // `import React from 'react'` is not required in React 17+
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off', // `import React from 'react'` is not required in React 17+
      },
    },
    {
      files: [
        '**/*.test.js',
        '**/*.test.ts',
        '**/*.test.jsx',
        '**/*.test.tsx',
        '**/*.spec.js',
        '**/*.spec.ts',
        '**/*.spec.jsx',
        '**/*.spec.tsx',
      ],
      rules: {
        'no-import-assign': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
  },
};
