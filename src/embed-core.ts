/**
 * @file Side-effect-free entry point for programmatic use (e.g. React wrapper).
 * Does NOT call renderGeoloniaMap() or set window.geolonia.
 * Only registers the PMTiles protocol, which is required for all users.
 */

import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

// PMTiles protocol registration (required side effect)
const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

export { default as GeoloniaMap } from './lib/geolonia-map';
export { default as GeoloniaMarker } from './lib/geolonia-marker';
export { SimpleStyle } from './lib/simplestyle';
export { default as SimpleStyleVector } from './lib/simplestyle-vector';
export { keyring } from './lib/keyring';
export { registerPlugin } from './lib/render';
export { VERSION as embedVersion } from './version';
export type { EmbedAttributes, EmbedPlugin } from './types';
export type { GeoloniaMapOptions } from './lib/geolonia-map';
