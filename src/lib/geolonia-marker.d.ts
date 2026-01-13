import maplibregl, { type MarkerOptions } from 'maplibre-gl';
/**
 * Geolonia default marker
 *
 * @param container
 */
export default class GeoloniaMarker extends maplibregl.Marker {
    constructor(options?: MarkerOptions, legacyOptions?: MarkerOptions);
}
