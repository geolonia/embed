/**
 * @file Entry for embed.js
 */

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import GeoloniaMap from './geolonia-map';
import GeoloniaMarker from './geolonia-marker';
import { checkPermission } from './util';
import parseAtts from './parse-atts';
import { parseApiKey } from './parse-api-key';
import pkg from '../../package.json';
import { SimpleStyle } from './simplestyle';
import { Protocol } from 'pmtiles';

export { GeoloniaMap as Map, GeoloniaMarker as Marker };
export type * from '../types';
export type { GeoloniaMapOptions } from './geolonia-map';

const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

if ( checkPermission() ) {
  let isDOMContentLoaded = false;
  const alreadyRenderedMaps = [];
  const plugins = [];
  const isRemoved = Symbol('map-is-removed');

  // Create the initial window.geolonia object if it doesn't exist.
  parseApiKey(document);

  /**
   *
   * @param {HTMLElement} target
   */
  const renderGeoloniaMap = (target) => {
    const map = new GeoloniaMap(target);

    // detect if the map removed manually
    map.on('remove', () => {
      map[isRemoved] = true;
    });

    // remove map instance automatically if the container removed.
    // prevent memory leak
    const observer = new MutationObserver((mutationRecords) => {
      const removed = mutationRecords.some((record) => [...record.removedNodes].some((node) => node === target));
      if (removed && !map[isRemoved]) {
        map.remove();
      }
    });
    observer.observe(target.parentNode, { childList: true });

    // plugin
    const atts = parseAtts(target);
    if (isDOMContentLoaded && !map[isRemoved]) {
      plugins.forEach((plugin) => plugin(map, target, atts));
    } else {
      alreadyRenderedMaps.push({ map, target: target, atts });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    isDOMContentLoaded = true;
    alreadyRenderedMaps.forEach(({ map, target, atts }) => {
      if (!map[isRemoved]) {
        plugins.forEach((plugin) => plugin(map, target, atts));
      }
    });
    // clear
    alreadyRenderedMaps.splice(0, alreadyRenderedMaps.length);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((item) => {
      if (!item.isIntersecting) {
        return;
      }
      renderGeoloniaMap(item.target);
      observer.unobserve(item.target);
    });
  });

  const containers = document.querySelectorAll('.geolonia[data-lazy-loading="off"]');
  const lazyContainers = document.querySelectorAll('.geolonia:not([data-lazy-loading="off"])');

  window.geolonia =
    window.maplibregl =
    window.mapboxgl = // Embed API backward compatibility
    Object.assign(window.geolonia, maplibregl);

  // This is required for correct initialization! Don't delete!
  const { key } = parseApiKey(document);
  if (key === 'no-api-key') {
    console.error('[Geolonia] Missing API key.') // eslint-disable-line
  }

  window.geolonia.Map = GeoloniaMap;
  window.geolonia.simpleStyle = // backward compatibility
    window.geolonia.SimpleStyle =
    SimpleStyle;
  window.geolonia.Marker = GeoloniaMarker;
  window.geolonia.embedVersion = pkg.version;
  window.geolonia.registerPlugin = (plugin) => {
    plugins.push(plugin);
    return void 0;
  };

  // render Map immediately
  for (let i = 0; i < containers.length; i++) {
    renderGeoloniaMap(containers[i]);
  }

  // set intersection observer
  for (let i = 0; i < lazyContainers.length; i++) {
    observer.observe(lazyContainers[i]);
  }
} else {
  console.error( '[Geolonia] We are very sorry, but we can\'t display our map in iframe.' ) // eslint-disable-line
}