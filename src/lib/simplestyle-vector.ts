'use strict';

import maplibregl from 'maplibre-gl';
import turfCenter from '@turf/center';
import { sanitizeDescription } from './util';

const textColor = '#000000';
const textHaloColor = '#FFFFFF';
const backgroundColor = 'rgba(255, 0, 0, 0.4)';
const strokeColor = '#FFFFFF';

class SimpleStyleVector {
  private sourceName: string;

  constructor(private url) {
    this.sourceName = 'vt-geolonia-simple-style';
  }

  addTo(map) {
    const container = map.getContainer();

    if (!container.dataset || (!container.dataset.lng && !container.dataset.lat)) {
      let initialZoomDone = false;
      map.on('sourcedata', (event) => {
        // skip events for sources that don't concern us
        if (event.sourceId !== this.sourceName) { return; }

        const source = map.getSource(event.sourceId);
        // query the map to see if the source is actually loaded or not. We can't trust `isSourceLoaded` in the event
        // because it's unreliable and often incorrect.
        const isLoaded = source && source.loaded();

        if (isLoaded !== true) { return; }

        // Only zoom once.
        if (initialZoomDone) { return; }
        initialZoomDone = true;

        map.fitBounds(source.bounds, {
          duration: 0,
          padding: 30,
        });
      });
    }

    map.addSource(this.sourceName, {
      type: 'vector',
      url: this.url,
    });

    this.setPolygonGeometries(map);
    this.setLineGeometries(map);

    map.addLayer({
      id: 'vt-geolonia-simple-style-polygon-symbol',
      type: 'symbol',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'text-color': ['string', ['get', 'text-color'], textColor],
        'text-halo-color': ['string', ['get', 'text-halo-color'], textHaloColor],
        'text-halo-width': 1,
      },
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-max-width': 12,
        'text-allow-overlap': false,
      },
    });

    map.addLayer({
      id: 'vt-geolonia-simple-style-linestring-symbol',
      type: 'symbol',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'text-color': ['string', ['get', 'text-color'], textColor],
        'text-halo-color': ['string', ['get', 'text-halo-color'], textHaloColor],
        'text-halo-width': 1,
      },
      layout: {
        'symbol-placement': 'line',
        'text-field': ['get', 'title'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-max-width': 12,
        'text-allow-overlap': false,
      },
    });

    this.setPointGeometries(map);
  }

  /**
   * Set polygon geometries.
   *
   * @param map
   */
  setPolygonGeometries(map) {
    map.addLayer({
      id: 'vt-geolonia-simple-style-polygon',
      type: 'fill',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['string', ['get', 'fill'], backgroundColor],
        'fill-opacity': ['number', ['get', 'fill-opacity'], 1.0],
        'fill-outline-color': ['string', ['get', 'stroke'], strokeColor],
      },
    });

    this.setPopup(map, 'vt-geolonia-simple-style-polygon');
  }

  /**
   * Set line geometries.
   *
   * @param map
   */
  setLineGeometries(map) {
    map.addLayer({
      id: 'vt-geolonia-simple-style-linestring',
      type: 'line',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-width': ['number', ['get', 'stroke-width'], 2],
        'line-color': ['string', ['get', 'stroke'], backgroundColor],
        'line-opacity': ['number', ['get', 'stroke-opacity'], 1.0],
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    });

    this.setPopup(map, 'vt-geolonia-simple-style-linestring');
  }

  /**
   * Setup point geometries.
   *
   * @param map
   */
  setPointGeometries(map) {
    map.addLayer({
      id: 'vt-circle-simple-style-points',
      type: 'circle',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['all', ['==', '$type', 'Point'], ['!has', 'marker-symbol']],
      paint: {
        'circle-radius': [
          'case',
          ['==', 'small', ['get', 'marker-size']], 7,
          ['==', 'large', ['get', 'marker-size']], 13,
          9,
        ],
        'circle-color': ['string', ['get', 'marker-color'], backgroundColor],
        'circle-opacity': ['number', ['get', 'fill-opacity'], 1.0],
        'circle-stroke-width': ['number', ['get', 'stroke-width'], 1],
        'circle-stroke-color': ['string', ['get', 'stroke'], strokeColor],
        'circle-stroke-opacity': ['number', ['get', 'stroke-opacity'], 1.0],
      },
    });

    map.addLayer({
      id: 'vt-geolonia-simple-style-points',
      type: 'symbol',
      source: this.sourceName,
      'source-layer': 'g-simplestyle-v1',
      filter: ['==', '$type', 'Point'],
      paint: {
        'text-color': ['string', ['get', 'text-color'], textColor],
        'text-halo-color': ['string', ['get', 'text-halo-color'], textHaloColor],
        'text-halo-width': 1,
      },
      layout: {
        'icon-image': ['get', 'marker-symbol'],
        'text-field': ['get', 'title'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-anchor': 'top',
        'text-max-width': 12,
        'text-offset': [
          'case',
          ['==', 'small', ['get', 'marker-size']], ['literal', [0, 0.6]],
          ['==', 'large', ['get', 'marker-size']], ['literal', [0, 1.2]],
          ['literal', [0, 0.8]],
        ],
        'text-allow-overlap': false,
      },
    });

    this.setPopup(map, 'vt-circle-simple-style-points');
    this.setPopup(map, 'vt-geolonia-simple-style-points');
  }

  async setPopup(map, source) {
    map.on('click', source, async (e) => {
      const center: [ number, number ] = turfCenter(e.features[0]).geometry.coordinates as [ number, number ];
      const description = e.features[0].properties.description;

      if (description) {
        const sanitizedDescription = await sanitizeDescription(description);
        new maplibregl.Popup().setLngLat(center).setHTML(sanitizedDescription).addTo(map);
      }
    });

    map.on('mouseenter', source, (e) => {
      if (e.features[0].properties.description) {
        map.getCanvas().style.cursor = 'pointer';
      }
    });

    map.on('mouseleave', source, () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

export default SimpleStyleVector;
