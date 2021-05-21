import * as mapboxgl from 'mapbox-gl'

export type Map = mapboxgl.Map
export type Marker = mapboxgl.Marker
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
  geoloniaControl: string:
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
  baseTilesVersion: string;
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
