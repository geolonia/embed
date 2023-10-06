import maplibregl, { FullscreenControl, GeolocateControl, NavigationControl, Popup, ScaleControl } from 'maplibre-gl';
import Marker from './geolonia-marker';
import { GeoloniaControl } from './controls/geolonia-control';
import CustomAttributionControl from './CustomAttributionControl';
import GestureHandling from '@geolonia/mbgl-gesture-handling';
import parseAtts from './parse-atts';

import { SimpleStyle } from './simplestyle';
import SimpleStyleVector from './simplestyle-vector';

import { getContainer, getOptions, getSessionId, getStyle, handleRestrictedMode, isScrollable, parseControlOption, parseSimpleVector } from './util';

import type { MapOptions, PointLike, StyleOptions, StyleSpecification, StyleSwapOptions } from 'maplibre-gl';

export type GeoloniaMapOptions = MapOptions & { interactive?: boolean };

type Container = HTMLElement & {
  geoloniaMap: GeoloniaMap;
};

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
  private geoloniaSourcesUrl: URL;
  private __styleExtensionLoadRequired: boolean;

  constructor(params: string | GeoloniaMapOptions) {
    const container = getContainer(params) as Container | false;

    if (!container) {
      if ( typeof params === 'string') {
        throw new Error(`[Geolonia] No HTML elements found matching \`${params}\`. Please ensure the map container element exists.`);
      } else {
        throw new Error('[Geolonia] No HTML elements found. Please ensure the map container element exists.');
      }
    }

    if (container.geoloniaMap) {
      return container.geoloniaMap;
    }

    if (container.clientHeight === 0) {
      // eslint-disable-next-line no-console
      console.warn('[Geolonia] Embed API failed to render the map because the container has no height. Please set the CSS property `height` to the container.');
    }

    const atts = parseAtts(container, { interactive: typeof params === 'object' ? params.interactive : true });
    const options = getOptions(container, params, atts);

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

    const sessionId = getSessionId(40);
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

      const transformedUrlObj = new URL(transformedUrl);

      if (resourceType === 'Source' && transformedUrl.startsWith('https://tileserver.geolonia.com')) {
        if (atts.stage !== 'v1') {
          transformedUrlObj.hostname = `tileserver-${atts.stage}.geolonia.com`;
        }
        transformedUrlObj.searchParams.set('sessionId', sessionId);
        transformedUrlObj.searchParams.set('key', atts.key);
        return {
          url: transformedUrlObj.toString(),
        };
      } else if (
        (resourceType === 'SpriteJSON' || resourceType === 'SpriteImage') &&
        transformedUrl.match(/^https:\/\/api\.geolonia\.com\/(dev|v1)\/sprites\//)
      ) {
        const pathParts = transformedUrlObj.pathname.split('/');
        pathParts[1] = atts.stage;
        transformedUrlObj.pathname = pathParts.join('/');
        transformedUrlObj.searchParams.set('key', atts.key);
        return {
          url: transformedUrlObj.toString(),
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
    const { position: geoloniaControlPosition } = parseControlOption(atts.geoloniaControl);
    map.addControl(new GeoloniaControl(),  geoloniaControlPosition);

    map.addControl(new CustomAttributionControl(), 'bottom-right');

    const { enabled: fullscreenControlEnabled, position: fullscreenControlPosition } = parseControlOption(atts.fullscreenControl);
    if (fullscreenControlEnabled) {
      map.addControl(new FullscreenControl(), fullscreenControlPosition);
    }

    const { enabled: navigationControlEnabled, position: navigationControlPosition } = parseControlOption(atts.navigationControl);
    if (navigationControlEnabled) {
      map.addControl(new NavigationControl(), navigationControlPosition);
    }

    const { enabled: geolocateControlEnabled, position: geolocateControlPosition } = parseControlOption(atts.geolocateControl);
    if (geolocateControlEnabled) {
      map.addControl(new GeolocateControl({}), geolocateControlPosition);
    }

    const { enabled: scaleControlEnabled, position: scaleControlPosition } = parseControlOption(atts.scaleControl);
    if (scaleControlEnabled) {
      map.addControl(new ScaleControl({}),  scaleControlPosition);
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

      if (atts.gestureHandling !== 'off' && isScrollable()) {
        new GestureHandling({ lang: atts.lang }).addTo(map);
      }

      if (atts.lat && atts.lng && atts.marker === 'on') {
        if (content) {
          const popup = new Popup({ offset: [0, -25] }).setHTML(content);
          let marker;
          if (atts.customMarker) {
            const offset = atts.customMarkerOffset.split(/,/).map((n) => {
              return Number(n.trim());
            });
            const container: HTMLElement = document.querySelector(atts.customMarker);
            container.style.display = 'block';
            marker = new Marker({
              element: container,
              offset: offset as PointLike,
            }).setLngLat(options.center).addTo(map).setPopup(popup);
          } else {
            marker = new Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map).setPopup(popup);
          }
          if (atts.openPopup === 'on') {
            marker.togglePopup();
          }
          marker.getElement().classList.add('geolonia-clickable-marker');
        } else {
          new Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map);
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
        const simpleVectorAttributeValue = parseSimpleVector(atts.simpleVector);
        new SimpleStyleVector(simpleVectorAttributeValue).addTo(map);
      }

      if (atts.geojson) {
        const el = isCssSelector(atts.geojson);
        let json;
        if (el) {
          json = JSON.parse(el.textContent);
        } else {
          json = atts.geojson;
        }

        const ss = new SimpleStyle(json, {
          cluster: (atts.cluster === 'on'),
          clusterColor: atts.clusterColor,
        });
        ss.addTo(map);

        if (!container.dataset || (!container.dataset.lng && !container.dataset.lat)) {
          ss.fitBounds();
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
        error.error.status === 402
      ) {
        handleRestrictedMode(map);
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
  setStyle(style: string | StyleSpecification, options: StyleSwapOptions & StyleOptions = {}): this {
    if (style !== null) {
      // It can't access `this` because `setStyle()` will be called with `super()`.
      // So, we need to run `parseAtts()` again(?)
      // Run parseAtts again to get the latest values from DOM.
      const atts = parseAtts(this.getContainer());

      // If style is object, it must be passed as it.
      if (typeof style === 'string') {
        style = getStyle(style, atts);
      }
    }

    // Tell the `styledata` event handler to load style extensions again
    this.__styleExtensionLoadRequired = true;
    // Calls `maplibregl.Map.setStyle()`.
    super.setStyle.call(this, style, options);

    return this;
  }

  remove(): void {
    const container = this.getContainer();
    super.remove.call(this);
    delete (container as HTMLElement & { geoloniaMap: GeoloniaMap }).geoloniaMap;
  }
}
