import { Geolonia } from '../src/embed';
declare global {
    interface Window {
        geolonia: Geolonia;
        maplibregl?: Geolonia;
        mapboxgl?: Geolonia;
    }
}
