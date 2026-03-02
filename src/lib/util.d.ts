import type { GetResourceResponse, MapOptions, MarkerOptions, ExpiryData } from 'maplibre-gl';
export type GetImageCallback = (error?: Error | null, image?: HTMLImageElement | ImageBitmap | null, expiry?: ExpiryData | null) => void;
/**
 *
 * @param {string} str target URL string
 * @return {string|false} Resolved URL or false if not resolved
 */
export declare function isURL(str: string): string | false;
export declare function isGeoloniaTilesHost(url: string | URL): boolean;
export declare function checkPermission(): boolean;
export declare function getLang(): "ja" | "en";
/**
 * Detects the window is scrollable.
 */
export declare function isScrollable(): boolean;
/**
 * Detects the object is HTMLElement?
 *
 * @param {*} o
 */
export declare function isDomElement(o: any): o is HTMLElement;
/**
 * Gets the HTMLElement for the map.
 * Possibility args are HTMLElement or CSS selector or object that has container property.
 *
 * @param {*} arg
 * @return {HTMLElement | false}
 */
export declare function getContainer(arg: HTMLElement | string | {
    container: HTMLElement | string;
}): HTMLElement | false;
/**
 * Merge legacyOptions into options for geolonia.Marker class
 *
 * @param {*} options
 * @param {*} legacyOptions
 */
export declare function handleMarkerOptions(options: MarkerOptions | null | undefined | false, legacyOptions: MarkerOptions): MarkerOptions;
export declare function getStyle(style: any, atts: any): any;
export declare function getOptions(container: any, params: any, atts: any): MapOptions;
/**
 *
 * @param {string} an data-*-control Embed attribute
 * @returns { enabled: boolean, position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | void }
 */
export declare function parseControlOption(att: any): {
    enabled: boolean;
    position: any;
};
/**
 *
 * @param {number} digits for session
 * @returns sessionId
 */
export declare const getSessionId: (digit: any) => string;
export declare const parseSimpleVector: (attributeValue: any) => any;
export declare const handleRestrictedMode: (map: any) => void;
export declare const handleErrorMode: (container: any) => void;
export declare const sanitizeDescription: (description: any) => Promise<any>;
export declare const random: (max: number) => number;
export declare function loadImageCompatibility(promise: Promise<GetResourceResponse<HTMLImageElement | ImageBitmap>>, callback: GetImageCallback): void;
