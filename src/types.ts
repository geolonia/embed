import type GeoloniaMap from './lib/geolonia-map';

export type EmbedAttributes = {
  lat: string | number;
  lng: string | number;
  zoom: string | number;
  bearing: string | number;
  pitch: string | number;
  hash: string;
  marker: string;
  markerColor: string;
  openPopup: string;
  customMarker: string;
  customMarkerOffset: string;
  gestureHandling: string;
  navigationControl: string;
  geolocateControl: string;
  fullscreenControl: string;
  scaleControl: string;
  geoloniaControl: string;
  geojson: string;
  cluster: string;
  clusterColor: string;
  style: string;
  lang: string;
  plugin: string;
  key: string;
  apiUrl: string;
  loader: string;
  /**
   * `data-error-message`：地図の初期化に失敗したときの表示。
   * 文字列を指定するとその文言に差し替え、`'off'` を指定するとエラー表示自体を行わない。
   * 未指定のときは Embed 既定の案内（復旧手順つき）を表示する。
   */
  errorMessage: string;
  minZoom: string | number;
  maxZoom: string | number;
  '3d': string;
  [otherKey: string]: string | number;
};

export type EmbedPlugin<
  PluginAttributes extends { [otherKey: string]: string } = {
    [otherKey: string]: string;
  },
> = (
  map: GeoloniaMap,
  target: HTMLElement,
  atts: EmbedAttributes & PluginAttributes,
) => void;
