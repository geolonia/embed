const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");

// eslint-plugin-import ではなく import-x を使う (geolonia/embed#561)。
// 本家は 2025-06-20 を最後にリリースが止まっており、eslint 10 を peer に
// 宣言したバージョンが無い。import-x はそのフォークで flat config に対応して
// いるため、@eslint/compat の fixupPluginRules も要らない。
const importX = require("eslint-plugin-import-x");
const promise = require("eslint-plugin-promise");

const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    extends: compat.extends(
        "eslint:recommended",
        "plugin:promise/recommended",
    ),

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
            ...globals.mocha,
        },

        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    plugins: {
        "import-x": importX,
        promise,
    },

    rules: {
        "array-callback-return": "error",
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "block-spacing": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "generator-star-spacing": "error",
        "no-console": "warn",
        "no-useless-computed-key": "error",
        "no-useless-rename": "error",
        "no-var": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "rest-spread-spacing": "error",
        "semi-spacing": "error",
        "sort-imports": "off",
        "space-before-blocks": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": "error",

        yoda: ["error", "never", {
            exceptRange: true,
        }],

        "import-x/no-extraneous-dependencies": ["warn", {
            "devDependencies": [
                "**/.eslintrc.js",
                "**/.eslintrc.cjs",
                "**/.mocharc.js",
                "**/.prettierrc.js",
                "**/jest.config.js",
                "**/next.config.js",
                "**/vite.config.js",
                "**/vite.config.ts",
                // import-x に替えて初めて報告されるようになった。本家は同じ
                // ファイルの prettier は報告するのに vitest だけ見落としていた。
                "**/vitest.config.ts",
                "**/webpack.config.js",
            ],
        }],

        "promise/prefer-await-to-then": "error",
    },
}, {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],

    rules: {
        "comma-dangle": ["error", "always-multiline"],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "no-duplicate-imports": "error",
        "no-useless-constructor": "error",

        "no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],

        quotes: ["error", "single"],
        semi: ["error", "always"],
        "no-loss-of-precision": "off",
    },
}, {
    files: ["**/*.cjs"],

    languageOptions: {
        sourceType: "script",
        parserOptions: {},
    },
}, {
    files: ["**/*.mjs"],

    languageOptions: {
        sourceType: "module",
        parserOptions: {},
    },
}, {
    files: ["**/*.ts"],
    extends: compat.extends("plugin:@typescript-eslint/recommended"),

    languageOptions: {
        parser: tsParser,
        sourceType: "module",
        parserOptions: {},
    },

    rules: {
        "@typescript-eslint/ban-ts-comment": ["off", {
            "ts-ignore": true,
        }],

        "comma-dangle": ["error", "always-multiline"],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "no-duplicate-imports": "error",
        "@typescript-eslint/no-useless-constructor": "error",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],

        "quotes": ["error", "single", {
            "avoidEscape": true,
        }],
        "semi": ["error", "always"],

        "@typescript-eslint/no-misused-promises": ["warn", {
            "checksConditionals": true,
            "checksVoidReturn": false,
        }],

        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-extra-semi": "off",
        "@typescript-eslint/no-loss-of-precision": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-var-requires": "off",
    },
}, {
    files: [
        "**/*.test.js",
        "**/*.test.ts",
        "**/*.spec.js",
        "**/*.spec.ts",
    ],

    rules: {
        "no-import-assign": "off",
        "import-x/no-extraneous-dependencies": "off",
    },
}, globalIgnores(["node_modules/", "docs", "dist", "eslint.config.js", ".*.js"])]);
