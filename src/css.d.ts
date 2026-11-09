// CSS を副作用 import している箇所のためのアンビエント宣言。
// TypeScript 6 は型を持たないモジュールの副作用 import を TS2882 として
// 報告するようになった (webpack 側は css-loader / style-loader が処理する)。
declare module '*.css';
