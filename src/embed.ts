/**
 * @file Entry for embed.js
 */

import * as maplibregl from 'maplibre-gl';
import GeoloniaMap from './lib/geolonia-map';
import GeoloniaMarker from './lib/geolonia-marker';
import { SimpleStyle } from './lib/simplestyle';
import { VERSION as embedVersion } from './version';
import { registerPlugin, renderGeoloniaMap } from './lib/render';

export type { GeoloniaMapOptions } from './lib/geolonia-map';

export type Popup = maplibregl.Popup;

export type EmbedAttributes = {
  lat: string;
  lng: string;
  zoom: string;
  bearing: string;
  pitch: string;
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
  minZoom: string;
  maxZoom: string;
  '3d': string;
  [otherKey: string]: string;
};

export type EmbedPlugin<PluginAttributes extends { [otherKey: string]: string } = {}> = (map: GeoloniaMap, target: HTMLElement, atts: EmbedAttributes & PluginAttributes) => void;

// Type for `window.geolonia`
export type Geolonia = Partial<typeof maplibregl> & {
  accessToken?: string;
  embedVersion: string;
  Map: typeof GeoloniaMap;
  Marker: typeof GeoloniaMarker;
  SimpleStyle: typeof SimpleStyle;
  simpleStyle: typeof SimpleStyle; // backward compatibility
  registerPlugin: (embedPlugin: EmbedPlugin) => void;
};

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
  }
}

const geolonia: Geolonia = Object.assign(window.geolonia || {}, maplibregl, {
  Map: GeoloniaMap,
  Marker: GeoloniaMarker,
  SimpleStyle: SimpleStyle,
  simpleStyle: SimpleStyle,
  embedVersion,
  registerPlugin,
});

window.geolonia =
  window.maplibregl =
  window.mapboxgl = geolonia;

renderGeoloniaMap();

export {
  geolonia,
  GeoloniaMap as Map,
  GeoloniaMarker as Marker,
  SimpleStyle,
  embedVersion,
};
