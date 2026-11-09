import 'maplibre-gl/dist/maplibre-gl.css';
import '../style.css';
import { GeoloniaMap, keyring } from '@geolonia/maps-core';
import { checkPermission, parseScriptTagApiKey } from './util';
import parseAtts, { attsToOptions } from './parse-atts';
import type { EmbedAttributes, EmbedPlugin } from '../types';

const plugins: EmbedPlugin[] = [];

/**
 * Move any inline HTML the author placed inside the map container into
 * `data-popup-content`, which is where maps-core reads the marker popup body
 * from. The container itself is emptied so the leftover markup doesn't render
 * behind the map. (Old embed read `container.innerHTML` directly; maps-core
 * takes options only.)
 */
const extractPopupContent = (target: HTMLElement) => {
  const content = target.innerHTML.trim();
  if (content) {
    target.dataset.popupContent = content;
  }
  target.innerHTML = '';
};

export const renderGeoloniaMap = () => {
  // maps-core's keyring no longer scans the DOM, so parse the embed script
  // tag here (`?geolonia-api-key=`) and push the key/stage into the keyring.
  const parsed = parseScriptTagApiKey();
  if (parsed) {
    keyring.setApiKey(parsed.apiKey);
    keyring.setStage(parsed.stage);
  }

  // Backward compat: maps-core's keyring no longer scans the DOM, but legacy
  // embeds set the key only on the container via `data-key`. Seed the keyring
  // from the first container-side key so the iframe permission check below
  // (and Geolonia-style validation) sees the same effective key as before.
  // Per-container `data-key` still flows through parseAtts → attsToOptions.
  if (!keyring.apiKey) {
    const keyed = document.querySelector<HTMLElement>('.geolonia[data-key]');
    const dataKey = keyed?.dataset.key;
    if (dataKey) {
      keyring.setApiKey(dataKey);
    }
  }

  if (checkPermission()) {
    let isDOMContentLoaded = false;
    const isRemoved = Symbol('map-is-removed');

    // 手動で remove された地図に印を付けるための symbol プロパティ。
    type RemovableMap = GeoloniaMap & { [isRemoved]?: boolean };

    const alreadyRenderedMaps: {
      map: RemovableMap;
      target: HTMLElement;
      atts: EmbedAttributes;
    }[] = [];

    /**
     *
     * @param {HTMLElement} target
     */
    const renderSingleMap = (target: HTMLElement) => {
      const atts = parseAtts(target);

      // Dedup: if this container was already initialised (e.g. constructed
      // programmatically before the lazy observer fired), reuse the instance.
      // Must happen before extractPopupContent(), otherwise we'd wipe the
      // already-rendered map DOM out of the container.
      let map: RemovableMap | undefined = target.geoloniaMap;
      if (!map) {
        // Grab inline popup content before maps-core clears/renders the container.
        extractPopupContent(target);
        map = new GeoloniaMap(attsToOptions(target, atts));
      }

      // detect if the map removed manually
      map.on('remove', () => {
        map[isRemoved] = true;
      });

      // remove map instance automatically if the container removed.
      // prevent memory leak
      const observer = new MutationObserver((mutationRecords) => {
        const removed = mutationRecords.some((record) =>
          [...record.removedNodes].some((node) => node === target),
        );
        if (removed && !map[isRemoved]) {
          map.remove();
        }
      });
      // 親が無いコンテナは DOM から外されることがないので監視しない。
      if (target.parentNode) {
        observer.observe(target.parentNode, { childList: true });
      }

      // plugin
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
        try {
          // 監視対象は下の querySelectorAll<HTMLElement> で集めた要素に限られる。
          renderSingleMap(item.target as HTMLElement);
        } catch (e) {
          // Not throw error because, following maps will not be rendered.
          console.error('[Geolonia] Failed to initialize map', e); // eslint-disable-line
        }
        observer.unobserve(item.target);
      });
    });

    const containers = document.querySelectorAll<HTMLElement>(
      '.geolonia[data-lazy-loading="off"]',
    );
    const lazyContainers = document.querySelectorAll<HTMLElement>(
      '.geolonia:not([data-lazy-loading="off"])',
    );

    // This is required for correct initialization! Don't delete!
    if (keyring.isGeoloniaStyle && !keyring.apiKey) {
      console.error('[Geolonia] Missing API key.'); // eslint-disable-line
    }

    // render Map immediately
    for (let i = 0; i < containers.length; i++) {
      try {
        renderSingleMap(containers[i]);
      } catch (e) {
        // Not throw error because, following maps will not be rendered.
        console.error('[Geolonia] Failed to initialize map', e); // eslint-disable-line
      }
    }

    // set intersection observer
    for (let i = 0; i < lazyContainers.length; i++) {
      observer.observe(lazyContainers[i]);
    }
  } else {
    /* eslint-disable-next-line no-console */
    console.error(
      "[Geolonia] We are very sorry, but we can't display our map in iframe.",
    );
  }
};

export const registerPlugin = (plugin: EmbedPlugin): void => {
  plugins.push(plugin);
  return void 0;
};
