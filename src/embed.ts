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
