/**
 * @file Entry point for programmatic use (e.g. React wrapper).
 * Does NOT call renderGeoloniaMap() or set window.geolonia.
 *
 * The Geolonia core (map, marker, simplestyle, keyring, PMTiles protocol
 * registration, ...) now lives in `@geolonia/maps-core`; this entry simply
 * re-exports it alongside embed-specific helpers (registerPlugin, version).
 *
 * 唯一の副作用として、UMD 出力で maplibre が worker を解決できない問題への対処
 * (`installMaplibreWorker()`) をここで行う。詳細は `./lib/maplibre-worker` を参照。
 */

import { installMaplibreWorker } from './lib/maplibre-worker';

installMaplibreWorker();

export {
  GeoloniaMap,
  GeoloniaMarker,
  SimpleStyle,
  SimpleStyleVector,
  keyring,
} from '@geolonia/maps-core';
export { registerPlugin } from './lib/render';
export { VERSION as embedVersion } from './version';
export type { EmbedAttributes, EmbedPlugin } from './types';
export type { GeoloniaMapOptions } from '@geolonia/maps-core';
