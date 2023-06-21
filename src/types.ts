import type AWS from 'aws-sdk';
import type * as maplibregl from 'maplibre-gl';
import type { AmazonLocationServiceMapProvider } from './lib/providers/amazon';
import type SimpleStyle from './lib/simplestyle';

export type GeoloniaMapOptions = Omit<maplibregl.MapOptions, 'style'> & { interactive?: boolean }
export class Map extends maplibregl.Map {
  constructor(geoloniaMapOptions: string | GeoloniaMapOptions);
}
export class Marker extends maplibregl.Marker {}
export class Popup extends maplibregl.Popup {}

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
}

export type EmbedPlugin<PluginAttributes extends { [otherKey: string]: string } = {}> = (map: Map, target: HTMLElement, atts: EmbedAttributes & PluginAttributes) => void

type Geolonia = {
  _stage?: string;
  _apiKey?: string;
  AmazonLocationServiceMapProvider?: typeof AmazonLocationServiceMapProvider;
  accessToken?: string;
  baseApiUrl?: string;
  embedVersion?: string;
  Map?: typeof Map;
  Marker?: typeof Marker;
  Popup?: typeof Popup;
  SimpleStyle?: typeof SimpleStyle;
  simpleStyle?: typeof SimpleStyle; // backward compatibility
  registerPlugin?: (embedPlugin: EmbedPlugin) => void;
} & typeof maplibregl;

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
    aws_amplify_core?, // TODO add type
    AWS?: typeof AWS,
  }
}
