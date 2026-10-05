/**
 * @file UMD バンドルで maplibre-gl v6 の worker を動かすための設定。
 *
 * maplibre-gl v6 は worker を `import.meta.url` 基準の実 URL として解決しますが、
 * webpack の `library.type: 'umd'` 出力では `import.meta.url` がビルド時に
 * ビルドマシンのファイルパス (`file:///...`) へ置換されます。maplibre はこれを
 * `https?:` でないと判断して worker URL を空文字へフォールバックするため、
 * **例外もコンソールエラーも出ないまま地図だけが表示されない** 状態になります。
 *
 * embed は「1 ファイルを置くだけで動く」ことが利点なので、worker を別ファイルとして
 * 配るのではなくバンドルへ文字列として埋め込み、実行時に Blob URL 化して maplibre へ
 * 渡します。埋め込む中身は `webpack.config.js` の `bundleMaplibreWorkerSource()` が
 * esbuild で自己完結する 1 ファイルへ束ねたものです（maps-core の `src/umd.ts` と同じ方式）。
 *
 * Blob worker を使うため、CSP を設定しているページでは `worker-src blob:` が必要です。
 *
 * @see https://github.com/geolonia/embed/issues/518
 */

import { setWorkerUrl } from 'maplibre-gl';

/** webpack の DefinePlugin がビルド時に worker のソース文字列へ置換する。 */
declare const __MAPLIBRE_WORKER_SOURCE__: string;

/**
 * 埋め込んだ worker を Blob URL 化して maplibre に登録する。
 *
 * 置換されていない環境（vitest など webpack を通らない実行）や、ブラウザ外
 * （SSR。Node にも Blob / URL.createObjectURL はあるので window で判定する）
 * では何もしない。その場合は maplibre 既定の解決にそのまま任せる。
 */
export const installMaplibreWorker = (): void => {
  const source =
    typeof __MAPLIBRE_WORKER_SOURCE__ === 'string'
      ? __MAPLIBRE_WORKER_SOURCE__
      : '';
  if (!source) {
    return;
  }
  if (
    typeof window === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return;
  }

  setWorkerUrl(
    URL.createObjectURL(new Blob([source], { type: 'text/javascript' })),
  );
};
