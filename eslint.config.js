const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");
const _import = require("eslint-plugin-import");
const promise = require("eslint-plugin-promise");

const {
    fixupPluginRules,
} = require("@eslint/compat");

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
        import: fixupPluginRules(_import),
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

        "import/no-extraneous-dependencies": ["warn", {
            "devDependencies": [
                "**/.eslintrc.js",
                "**/.eslintrc.cjs",
                "**/.mocharc.js",
                "**/.prettierrc.js",
                "**/jest.config.js",
                "**/next.config.js",
                "**/vite.config.js",
                "**/vite.config.ts",
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
        "import/no-extraneous-dependencies": "off",
    },
}, globalIgnores(["node_modules/", "docs", "dist", "eslint.config.js", ".*.js"])]);
