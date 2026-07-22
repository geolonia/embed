import type { GeoloniaMap } from '@geolonia/maps-core';

/**
 * `.geolonia` の地図コンテナから読み取った `data-*` 属性を正規化した形。
 *
 * 各プロパティは kebab-case の `data-*` 属性に対応する（`markerColor` は
 * `data-marker-color`、`'3d'` は `data-3d`）。
 * `parseAtts` がコンテナの `dataset` を読み、以下に示す既定値を補う。
 * `data-*` で指定された値は文字列のまま保持され、未指定の数値フィールドには
 * 数値の既定値が入る。on/off のフラグはリテラル文字列 `'on'` / `'off'` である。
 * この形はそのまま登録済みの {@link EmbedPlugin} に渡されるため、後方互換のために
 * 構造を安定させている。地図自体はこの値から `attsToOptions` を経て構築される。
 */
export type EmbedAttributes = {
  /**
   * `data-lat`：地図中心の緯度。中心は `data-lat` と `data-lng` の両方が
   * 指定されたときにのみ適用される。
   * @defaultValue `0`
   */
  lat: string | number;
  /**
   * `data-lng`：地図中心の経度。{@link EmbedAttributes.lat} を参照。
   * @defaultValue `0`
   */
  lng: string | number;
  /**
   * `data-zoom`：初期ズームレベル。
   * @defaultValue `0`
   */
  zoom: string | number;
  /**
   * `data-bearing`：初期方位（回転）。単位は度。
   * @defaultValue `0`
   */
  bearing: string | number;
  /**
   * `data-pitch`：初期ピッチ（傾き）。単位は度。
   * @defaultValue `0`
   */
  pitch: string | number;
  /**
   * `data-hash`（`'on'` / `'off'`）：地図の表示位置を URL のハッシュに同期する。
   * @defaultValue `'off'`
   */
  hash: string;
  /**
   * `data-marker`（`'on'` / `'off'`）：中心にマーカーを表示する。中心が設定されて
   * いるときにのみ有効（{@link EmbedAttributes.lat} を参照）。
   * @defaultValue `'on'`
   */
  marker: string;
  /**
   * `data-marker-color`：中心マーカーの色。
   * @defaultValue `'#E4402F'`
   */
  markerColor: string;
  /**
   * `data-open-popup`（`'on'` / `'off'`）：読み込み時にマーカーのポップアップを開く。
   * @defaultValue `'off'`
   */
  openPopup: string;
  /**
   * `data-custom-marker`：マーカーとして使う要素の CSS セレクタ。
   * @defaultValue `''`
   */
  customMarker: string;
  /**
   * `data-custom-marker-offset`：マーカーのオフセット。`"x, y"` 形式のピクセル値。
   * @defaultValue `'0, 0'`
   */
  customMarkerOffset: string;
  /**
   * `data-gesture-handling`（`'on'` / `'off'`）：パン、ズーム、回転のジェスチャを
   * 有効にする。地図を非インタラクティブに生成した場合は `'off'` に固定される。
   * @defaultValue `'on'`
   */
  gestureHandling: string;
  /**
   * `data-navigation-control`：ズームと回転のコントロール。`'on'` / `'off'`、または
   * 表示位置（`'top-right'`、`'bottom-left'` など）を受け付ける。
   * @defaultValue `'on'`
   */
  navigationControl: string;
  /**
   * `data-geolocate-control`：現在地コントロール。`'on'` / `'off'`、または表示位置を
   * 受け付ける。
   * @defaultValue `'off'`
   */
  geolocateControl: string;
  /**
   * `data-fullscreen-control`：全画面コントロール。`'on'` / `'off'`、または表示位置を
   * 受け付ける。
   * @defaultValue `'off'`
   */
  fullscreenControl: string;
  /**
   * `data-scale-control`：スケールバー。`'on'` / `'off'`、または表示位置を受け付ける。
   * @defaultValue `'off'`
   */
  scaleControl: string;
  /**
   * `data-geolonia-control`：Geolonia のアトリビューション（ロゴ）コントロール。
   * `'on'` / `'off'`、または表示位置を受け付ける。
   * @defaultValue `'on'`
   */
  geoloniaControl: string;
  /**
   * `data-geojson`：GeoJSON のソース。URL、インラインの JSON 文字列、または
   * インライン要素（`<script type="application/json">` など）を指す CSS セレクタの
   * いずれか。
   * @defaultValue `''`
   */
  geojson: string;
  /**
   * `data-cluster`（`'on'` / `'off'`）：GeoJSON のポイント地物をクラスタリングする。
   * @defaultValue `'on'`
   */
  cluster: string;
  /**
   * `data-cluster-color`：クラスタ化されたポイントマーカーの色。
   * @defaultValue `'#ff0000'`
   */
  clusterColor: string;
  /**
   * `data-style`：地図スタイル。Geolonia のスタイル名（`geolonia/basic-v2`）、
   * style.json の完全な URL、または相対パスのいずれか。
   * @defaultValue `'geolonia/basic-v2'`
   */
  style: string;
  /**
   * `data-lang`：ラベルの言語。`data-lang` に指定できるのは `'ja'`、`'en'`、
   * `'auto'` など。`parseAtts` は `'ja'` のみを `'ja'` に解決し、それ以外の明示値は
   * `'en'` に解決する（`'ja-jp'` も `'en'` になる）。`'auto'` および未指定のときは
   * ブラウザ言語（`getLang()` の結果。`'ja'` または `'en'`）になる。
   * @defaultValue 未指定のときは `getLang()` の結果（`'ja'` または `'en'`）
   */
  lang: string;
  /**
   * `data-plugin`：実行する埋め込みプラグイン名。無効にする場合は `'off'`。
   * @defaultValue `'off'`
   */
  plugin: string;
  /**
   * `data-key`：Geolonia の API キー（埋め込み `<script>` タグの
   * `?geolonia-api-key=` クエリで指定しない場合に使う）。
   * @defaultValue キーリングが保持する現在の API キー
   */
  key: string;
  /**
   * `data-api-url`：Geolonia API のエンドポイントのベース URL。
   * @defaultValue `` `https://api.geolonia.com/${stage}` ``
   */
  apiUrl: string;
  /**
   * `data-loader`（`'on'` / `'off'`）：地図の初期化中にローディング表示を出す。
   * @defaultValue `'on'`
   */
  loader: string;
  /**
   * `data-min-zoom`：最小ズームレベル。空文字列は「未指定」を意味する。
   * @defaultValue `''`
   */
  minZoom: string | number;
  /**
   * `data-max-zoom`：最大ズームレベル。
   * @defaultValue `20`
   */
  maxZoom: string | number;
  /**
   * `data-3d`（`'on'` / `'off'`）：3D 建物を描画する。
   * @defaultValue `''`（off として扱われる）
   */
  '3d': string;
  /**
   * 追加の `data-*` 属性はそのまま透過される（{@link EmbedPlugin} が利用する
   * プラグイン固有の属性など）。
   */
  [otherKey: string]: string | number;
};

/**
 * 埋め込みプラグインの型。地図インスタンス、対象のコンテナ要素、正規化済みの
 * {@link EmbedAttributes} を受け取って呼び出される。
 *
 * 呼び出しのタイミングは地図の生成時点で異なる。`DOMContentLoaded` 後に生成された
 * 地図では生成直後に呼び出される。それ以前に生成された地図では `DOMContentLoaded`
 * まで保留され、そのイベント時にまとめて呼び出される。呼び出し前に削除された地図に
 * 対しては呼び出されない。
 */
export type EmbedPlugin<
  PluginAttributes extends { [otherKey: string]: string } = {
    [otherKey: string]: string;
  },
> = (
  map: GeoloniaMap,
  target: HTMLElement,
  atts: EmbedAttributes & PluginAttributes,
) => void;
