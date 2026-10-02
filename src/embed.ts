/**
 * @file Entry for embed.js
 */

import * as maplibregl from 'maplibre-gl';
import { GeoloniaMap, GeoloniaMarker, SimpleStyle } from '@geolonia/maps-core';
import { VERSION as embedVersion } from './version';
import { installMaplibreWorker } from './lib/maplibre-worker';
import { registerPlugin, renderGeoloniaMap } from './lib/render';

export type { GeoloniaMapOptions } from '@geolonia/maps-core';

export type Popup = maplibregl.Popup;

export type { EmbedAttributes, EmbedPlugin } from './types';
import type { EmbedPlugin } from './types';

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
    geolonia: Geolonia;
    maplibregl?: Geolonia;
    mapboxgl?: Geolonia;
  }
}

// UMD 出力では maplibre が worker を自力で解決できない。地図を作る前に
// バンドルへ埋め込んだ worker を登録する (#518)。
installMaplibreWorker();

const geolonia: Geolonia = Object.assign(window.geolonia || {}, maplibregl, {
  Map: GeoloniaMap,
  Marker: GeoloniaMarker,
  SimpleStyle: SimpleStyle,
  simpleStyle: SimpleStyle,
  embedVersion,
  registerPlugin,
});

window.geolonia = (window.maplibregl as any) = window.mapboxgl = geolonia;

renderGeoloniaMap();

export {
  geolonia,
  GeoloniaMap as Map,
  GeoloniaMarker as Marker,
  SimpleStyle,
  embedVersion,
};
