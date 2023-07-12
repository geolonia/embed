import * as maplibregl from 'maplibre-gl';
import GeoloniaMap from './lib/geolonia-map';
import GeoloniaMarker from './lib/geolonia-marker';
import { registerPlugin, renderGeoloniaMap } from './lib/render';
import { SimpleStyle } from './lib/simplestyle';
import pkg from '../package.json';

const embedVersion = pkg.version;

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
export type Geolonia = {
  _stage?: string;
  _apiKey?: string;
  accessToken?: string;
  baseApiUrl?: string;
  embedVersion?: string;
  Map?: typeof GeoloniaMap;
  Marker?: typeof GeoloniaMarker;
  Popup?: Popup;
  SimpleStyle?: typeof SimpleStyle;
  simpleStyle?: typeof SimpleStyle; // backward compatibility
  registerPlugin?: (embedPlugin: EmbedPlugin) => void;
} & Partial<typeof maplibregl>;

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
  }
}

const exposeUnderWindow = () => {
  window.geolonia =
    window.maplibregl =
    window.mapboxgl = // Embed API backward compatibility
    Object.assign(window.geolonia, maplibregl);

  window.geolonia.Map = GeoloniaMap;
  window.geolonia.simpleStyle = // backward compatibility
    window.geolonia.SimpleStyle =
    SimpleStyle;
  window.geolonia.Marker = GeoloniaMarker;
  window.geolonia.embedVersion = embedVersion;
  window.geolonia.registerPlugin = registerPlugin;
};

export {
  GeoloniaMap,
  GeoloniaMarker,
  SimpleStyle,
  registerPlugin,
  renderGeoloniaMap,
  embedVersion,
  exposeUnderWindow,

  // backward compatibility
  GeoloniaMap as Map,
  GeoloniaMarker as Marker,
};
