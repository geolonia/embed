import * as maplibregl from 'maplibre-gl';

export interface MapOptions extends maplibregl.MapboxOptions {
  interactive?: boolean;

  /**
   * The container to mount this map in. Can be a DOM element, or a string
   * containing a CSS selector.
   * If you use a CSS selector, the map will be mounted in the first element
   * matching.
   */
  container?: HTMLElement | string;

  style?: string;
  transformRequest?: maplibregl.TransformRequestFunction;
}

export class Map extends maplibregl.Map {
  /** Use this to create a new Map instance. */
  constructor(options?: MapOptions | HTMLElement);
}

export type Marker = maplibregl.Marker
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

declare global {
  interface Window {
    geolonia: {
      accessToken: string
      baseApiUrl: string
      Map: Map
      Marker: Marker
      registerPlugin: (embedPlugin: EmbedPlugin) => void
    }
  }
}
