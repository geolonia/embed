// 型を持たないモジュールと、maps-core が実行時に生やすプロパティのための
// アンビエント宣言をここにまとめている。

declare module '*.svg' {
  const content: string;
  export default content;
}

// TypeScript 6 は型を持たないモジュールの副作用 import を TS2882 として
// 報告するようになった。webpack 側は css-loader / style-loader が処理する。
declare module '*.css';

// maps-core は初期化した地図インスタンスをコンテナ要素に生やす。
// render.ts の二重初期化チェックと e2e がこれを読んでいる。
//
// このファイルはアンビエント宣言のためのスクリプト (module ではない) なので、
// グローバルの HTMLElement をそのまま宣言マージする。declare global は module で
// しか使えず、module にすると上の declare module '*.svg' が書けなくなる。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HTMLElement {
  geoloniaMap?: import('@geolonia/maps-core').GeoloniaMap;
}
