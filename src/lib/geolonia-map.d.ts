import maplibregl, { MapOptions, StyleOptions, StyleSpecification, StyleSwapOptions, GetResourceResponse } from 'maplibre-gl';
import { GetImageCallback } from './util';
export type GeoloniaMapOptions = MapOptions & {
    interactive?: boolean;
};
/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMap extends maplibregl.Map {
    private geoloniaSourcesUrl;
    private __styleExtensionLoadRequired;
    constructor(params: string | GeoloniaMapOptions);
    /**
     *
     * @param {string|null} style style identity or `null` when map.remove()
     * @param {*} options
     */
    setStyle(style: string | StyleSpecification, options?: StyleSwapOptions & StyleOptions): this;
    remove(): void;
    /**
     *  Backward compatibility for breaking change of loadImage() in MapLibre GL JS v4.0.0.
     *  Related to https://github.com/maplibre/maplibre-gl-js/pull/3422/
     * @param url
     * @param callback
     */
    loadImage(url: string, callback: GetImageCallback): void;
    loadImage(url: string): Promise<GetResourceResponse<HTMLImageElement | ImageBitmap>>;
}
