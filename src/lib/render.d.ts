import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import GeoloniaMap from './geolonia-map';
export declare const renderGeoloniaMap: () => void;
export declare const registerPlugin: (plugin: (map: GeoloniaMap, target: HTMLElement, atts: any) => void) => void;
