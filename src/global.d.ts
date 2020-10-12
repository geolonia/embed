declare namespace Geolonia {
  export interface EmbedAttribute {
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
  export type EmbedPlugin = (map: mapboxgl.Map, target: HTMLElement, atts: EmbedAttribute) => void
}
