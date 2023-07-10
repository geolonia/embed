import type * as maplibregl from 'maplibre-gl';
import type GeoloniaMap from './lib/geolonia-map';
import type GeoloniaMarker from './lib/geolonia-marker';
import type { SimpleStyle } from './lib/simplestyle';

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
} & typeof maplibregl;

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
  }
}
