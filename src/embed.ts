/**
 * @file Entry for embed.js
 */

import geolonia, { type Geolonia } from './index';
import { renderGeoloniaMap } from './lib/render';

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
  }
}

window.geolonia =
  window.maplibregl =
  window.mapboxgl = // Embed API backward compatibility
  geolonia;

renderGeoloniaMap();
