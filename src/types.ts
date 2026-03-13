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
  stage: string;
  loader: string;
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
