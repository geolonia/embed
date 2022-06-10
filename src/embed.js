/**
 * @file Entry for embed.js
 */

import 'intersection-observer';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import GeoloniaMap from './lib/geolonia-map';
import GeoloniaMarker from './lib/geolonia-marker';
import { AmazonLocationServiceMapProvider } from './lib/providers/amazon';
import * as util from './lib/util';
import parseAtts from './lib/parse-atts';
import parseApiKey from './lib/parse-api-key';
import pkg from '../package.json';
import simpleStyle from './lib/simplestyle';

if ( util.checkPermission() ) {
  let isDOMContentLoaded = false;
  const alreadyRenderedMaps = [];
  const plugins = [];
  const isRemoved = Symbol('map-is-removed');

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
     maplibregl;

  // This is required for correct initialization! Don't delete!
  const { key } = parseApiKey(document);
  if (key === 'no-api-key') {
     console.error('Missing API key.') // eslint-disable-line
  }

  window.geolonia.Map = GeoloniaMap;
  window.geolonia.simpleStyle = simpleStyle;
  window.geolonia.Marker = GeoloniaMarker;
  window.geolonia.AmazonLocationServiceMapProvider = AmazonLocationServiceMapProvider;
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
