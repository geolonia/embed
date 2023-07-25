import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import GeoloniaMap from './geolonia-map';
import { checkPermission } from './util';
import parseAtts from './parse-atts';
import { keyring } from './keyring';
import { Protocol } from 'pmtiles';

const plugins = [];

export const renderGeoloniaMap = () => {
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);

  if ( checkPermission() ) {
    let isDOMContentLoaded = false;
    const alreadyRenderedMaps = [];
    const isRemoved = Symbol('map-is-removed');

    keyring.parse();

    /**
     *
     * @param {HTMLElement} target
     */
    const renderSingleMap = (target) => {
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
        renderSingleMap(item.target);
        observer.unobserve(item.target);
      });
    });

    const containers = document.querySelectorAll('.geolonia[data-lazy-loading="off"]');
    const lazyContainers = document.querySelectorAll('.geolonia:not([data-lazy-loading="off"])');

    // This is required for correct initialization! Don't delete!
    if (!keyring.apiKey) {
      console.error('[Geolonia] Missing API key.') // eslint-disable-line
    }

    // render Map immediately
    for (let i = 0; i < containers.length; i++) {
      renderSingleMap(containers[i]);
    }

    // set intersection observer
    for (let i = 0; i < lazyContainers.length; i++) {
      observer.observe(lazyContainers[i]);
    }
  } else {
    console.error( '[Geolonia] We are very sorry, but we can\'t display our map in iframe.' ) // eslint-disable-line
  }
};

export const registerPlugin = (plugin: (map: GeoloniaMap, target: HTMLElement, atts) => void): void => {
  plugins.push(plugin);
  return void 0;
};
