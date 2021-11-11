import 'whatwg-fetch';
import 'promise-polyfill/src/polyfill';
import maplibregl from 'maplibre-gl';
import GeoloniaControl from '@geolonia/mbgl-geolonia-control';
import GestureHandling from '@geolonia/mbgl-gesture-handling';
import parseAtts from './parse-atts';

import * as util from './util';

const isCssSelector = (string) => {
  if (/^https?:\/\//.test(string)) {
    return false;
  } else if (/^\//.test(string)) {
    return false;
  } else if (/^\.\//.test(string)) {
    return false;
  } else if (/^\.\.\//.test(string)) {
    return false;
  } else {
    try {
      return document.querySelector(string);
    } catch (e) {
      return false;
    }
  }
};

/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMap extends maplibregl.Map {
  constructor(params) {
    const container = util.getContainer(params);
    if (container.geoloniaMap) {
      return container.geoloniaMap;
    }

    const atts = parseAtts(container, params);
    const options = util.getOptions(container, params, atts);

    // Getting content should be fire just before initialize the map.
    const content = container.innerHTML.trim();
    container.innerHTML = '';

    let loading;
    if (atts.loader !== 'off') {
      loading = document.createElement('div');
      // prevent pinchin & pinchout
      loading.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      });
      loading.className = 'loading-geolonia-map';
      loading.innerHTML = `<div class="lds-grid"><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div></div>`;
      container.appendChild(loading);
    }

    const sessionId = util.getSessionId(40);
    const sourcesUrl = new URL(`${atts.apiUrl}/sources`);
    sourcesUrl.searchParams.set('key', atts.key);
    sourcesUrl.searchParams.set('sessionId', sessionId);

    // Pass API key and requested tile version to `/sources` (tile json).
    const _transformRequest = options.transformRequest;
    options.transformRequest = (url, resourceType) => {
      if (resourceType === 'Source' && url.startsWith('https://api.geolonia.com')) {
        return {
          url: sourcesUrl.toString(),
        };
      }

      let transformedUrl = url;
      if (url.startsWith('geolonia://')) {
        const tilesMatch = url.match(/^geolonia:\/\/tiles\/(?<username>.+)\/(?<customtileId>.+)/);
        if (tilesMatch) {
          transformedUrl = `https://tileserver.geolonia.com/customtiles/${tilesMatch.groups.customtileId}/tiles.json`;
        }
      }

      if (resourceType === 'Source' && transformedUrl.startsWith('https://tileserver.geolonia.com')) {
        const tileserverSourcesUrl = new URL(transformedUrl);
        if (atts.stage !== 'v1') {
          tileserverSourcesUrl.hostname = `tileserver-${atts.stage}.geolonia.com`;
        }
        tileserverSourcesUrl.searchParams.set('sessionId', sessionId);
        tileserverSourcesUrl.searchParams.set('key', atts.key);
        return {
          url: tileserverSourcesUrl.toString(),
        };
      }

      let request;
      // Additional transformation
      if (typeof _transformRequest === 'function') {
        request = _transformRequest(transformedUrl, resourceType);
      }

      return request;
    };

    // Generate Map
    super(options);
    const map = this;
    this.geoloniaSourcesUrl = sourcesUrl;
    this.__styleExtensionLoadRequired = true;

    // Note: GeoloniaControl should be placed before another controls.
    // Because this control should be "very" bottom-left(default) or the attributed position.
    const { position: geoloniaControlPosition } = util.parseControlOption(atts.geoloniaControl);
    map.addControl(new GeoloniaControl(),  geoloniaControlPosition);

    const { enabled: fullscreenControlEnabled, position: fullscreenControlPosition } = util.parseControlOption(atts.fullscreenControl);
    if (fullscreenControlEnabled) {
      // IE patch for fullscreen mode
      if (!container.classList.contains('geolonia')) {
        document.onmsfullscreenchange = () => {
          const isFullscreen = document.msFullscreenElement === container;
          if (isFullscreen) {
            map._beforeFullscreenWidth = container.style.width;
            map._beforeFullscreenHeight = container.style.height;
            container.style.width = '100%';
            container.style.height = '100%';
          } else {
            container.style.width = map._beforeFullscreenWidth;
            container.style.height = map._beforeFullscreenHeight;
          }
        };
      }
      map.addControl(new window.geolonia.FullscreenControl(), fullscreenControlPosition);
    }

    const { enabled: navigationControlEnabled, position: navigationControlPosition } = util.parseControlOption(atts.navigationControl);
    if (navigationControlEnabled) {
      map.addControl(new window.geolonia.NavigationControl(), navigationControlPosition);
    }

    const { enabled: geolocateControlEnabled, position: geolocateControlPosition } = util.parseControlOption(atts.geolocateControl);
    if (geolocateControlEnabled) {
      map.addControl(new window.geolonia.GeolocateControl(), geolocateControlPosition);
    }

    const { enabled: scaleControlEnabled, position: scaleControlPosition } = util.parseControlOption(atts.scaleControl);
    if (scaleControlEnabled) {
      map.addControl(new window.geolonia.ScaleControl(),  scaleControlPosition);
    }

    map.on('load', (event) => {
      const map = event.target;

      if (atts.loader !== 'off') {
        try {
          container.removeChild(loading);
        } catch (e) {
          // Nothing to do.
        }
      }

      if (atts.gestureHandling !== 'off' && util.isScrollable()) {
        new GestureHandling({ lang: atts.lang }).addTo(map);
      }

      if (atts.lat && atts.lng && atts.marker === 'on') {
        if (content) {
          const popup = new window.geolonia.Popup({ offset: [0, -25] }).setHTML(content);
          let marker;
          if (atts.customMarker) {
            const offset = atts.customMarkerOffset.split(/,/).map((n) => {
              return Number(n.trim());
            });
            const container = document.querySelector(atts.customMarker);
            container.style.display = 'block';
            marker = new window.geolonia.Marker({
              element: container,
              offset: offset,
            }).setLngLat(options.center).addTo(map).setPopup(popup);
          } else {
            marker = new window.geolonia.Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map).setPopup(popup);
          }
          if (atts.openPopup === 'on') {
            marker.togglePopup();
          }
          marker.getElement().classList.add('geolonia-clickable-marker');
        } else {
          new window.geolonia.Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map);
        }
      }
    });

    map.on('styledata', async (event) => {
      const map = event.target;

      if (!this.__styleExtensionLoadRequired) {
        return;
      }
      this.__styleExtensionLoadRequired = false;

      if (atts.simpleVector) {
        const simpleVectorAttributeValue = util.parseSimpleVector(atts.simpleVector);
        const { default: SimpleStyleVector } = await import('./simplestyle-vector');
        new SimpleStyleVector(simpleVectorAttributeValue).addTo(map);
      }

      if (atts.geojson) {
        const el = isCssSelector(atts.geojson);
        const { default: SimpleStyle } = await import('./simplestyle');
        if (el) {
          const json = JSON.parse(el.textContent);
          new SimpleStyle(json, {
            cluster: (atts.cluster === 'on'),
            clusterColor: atts.clusterColor,
          }).addTo(map);
        } else {
          fetch(atts.geojson).then((response) => {
            return response.json();
          }).then((json) => {
            new SimpleStyle(json, {
              cluster: (atts.cluster === 'on'),
              clusterColor: atts.clusterColor,
            }).addTo(map);
          });
        }
      }

      if (atts['3d']) {
        const style = map.getStyle();
        style.layers.forEach((layer) => {
          if (atts['3d'] === 'on' && layer.metadata && layer.metadata['visible-on-3d'] === true) {
            map.setLayoutProperty(layer.id, 'visibility', 'visible');
          } else if (atts['3d'] === 'off' && layer.metadata && layer.metadata['visible-on-3d'] === true) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          } else if (atts['3d'] === 'on' && layer.metadata && layer.metadata['hide-on-3d'] === true) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          } else if (atts['3d'] === 'off' && layer.metadata && layer.metadata['hide-on-3d'] === true) {
            map.setLayoutProperty(layer.id, 'visibility', 'visible');
          }
        });
      }
    });

    // handle Geolonia Server errors
    map.on('error', async (error) => {
      if (
        error.error &&
        error.error.status === 402 &&
        error.source &&
        (
          error.source.url.startsWith('https://tileserver-dev.geolonia.com') ||
          error.source.url.startsWith('https://tileserver.geolonia.com')
        )
      ) {
        util.handleRestrictedMode(map);
      }
    });

    container.geoloniaMap = map;

    return map;
  }

  /**
   *
   * @param {string|null} style style identity or `null` when map.remove()
   * @param {*} options
   */
  setStyle(style, options = {}) {
    if (style !== null) {
      // It can't access `this` because `setStyle()` will be called with `super()`.
      // So, we need to run `parseAtts()` again(?)
      // Run parseAtts again to get the latest values from DOM.
      const atts = parseAtts(this.getContainer());

      // If style is object, it must be passed as it.
      if (typeof style === 'string') {
        style = util.getStyle(style, atts);
      }
    }

    // Tell the `styledata` event handler to load style extensions again
    this.__styleExtensionLoadRequired = true;
    // Calls `maplibregl.Map.setStyle()`.
    super.setStyle.call(this, style, options);
  }
}
