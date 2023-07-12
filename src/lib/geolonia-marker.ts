'use strict';

import maplibregl from 'maplibre-gl';
import tinycolor from 'tinycolor2';
import markerSVG from './marker.svg';
import { handleMarkerOptions } from './util';
import type { MarkerOptions } from 'maplibre-gl';

/**
 * Geolonia default marker
 *
 * @param container
 */
export default class GeoloniaMarker extends maplibregl.Marker {
  constructor(options: MarkerOptions = {}, legacyOptions: MarkerOptions = {}) {
    options = handleMarkerOptions(options, legacyOptions);

    if (!options || !options.element) {
      const markerElement = document.createElement('div');
      markerElement.className = 'geolonia-default-marker';
      markerElement.innerHTML = markerSVG;

      // Following shoud follow the dimention of marker.svg 52:67.
      markerElement.style.margin = '0';
      markerElement.style.padding = '0';
      markerElement.style.width = '26px';
      markerElement.style.height = '34px';

      const markerObj = markerElement.querySelector('svg');
      markerObj.style.width = '100%';
      markerObj.style.height = '100%';

      options.element = markerElement;

      if (options.color) {
        (markerElement.querySelector('.left') as HTMLElement).style.fill = options.color;
        (markerElement.querySelector('.right') as HTMLElement).style.fill = tinycolor(options.color).darken().toString();
      } else {
        const defaultColor = '#E4402F';
        (markerElement.querySelector('.left') as HTMLElement).style.fill = defaultColor;
        (markerElement.querySelector('.right') as HTMLElement).style.fill = tinycolor(defaultColor).darken().toString();
      }

      options.offset = [0, -15];
    }

    super(options);
    return this;
  }
}
