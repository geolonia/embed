'use strict';

import maplibregl from 'maplibre-gl';
import geojsonExtent from '@mapbox/geojson-extent';
import turfCenter from '@turf/center';
import sanitizeHtml from 'sanitize-html';

const textColor = '#000000';
const textHaloColor = '#FFFFFF';
const backgroundColor = 'rgba(255, 0, 0, 0.4)';
const strokeColor = '#FFFFFF';

class SimpleStyle {
  constructor(json, options) {
    this.json = json;

    this.options = {
      id: 'geolonia-simple-style',
      cluster: true,
      heatmap: false,
      clusterColor: '#ff0000',
      ...options,
    };
  }

  getLayerId() {
    return this.options.id
  }

  addTo(map) {
    const features = this.json.features;
    const polygonandlines = features.filter((feature) => (feature.geometry.type.toLowerCase() !== 'point'));
    const points = features.filter((feature) => (feature.geometry.type.toLowerCase() === 'point'));

    map.addSource(this.options.id, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygonandlines,
      },
    });

    this.setPolygonGeometries(map);
    this.setLineGeometries(map);

    map.addSource(`${this.options.id}-points`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: points,
      },
      cluster: this.options.cluster,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    map.addLayer({
      id: `${this.options.id}-polygon-symbol`,
      type: 'symbol',
      source: this.options.id,
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
      id: `${this.options.id}-linestring-symbol`,
      type: 'symbol',
      source: this.options.id,
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
    this.setCluster(map);

    const container = map.getContainer();

    if (!container.dataset || (!container.dataset.lng && !container.dataset.lat)) {
      const bounds = geojsonExtent(this.json);
      map.fitBounds(bounds, {
        duration: 0,
        padding: 30,
      });
    }
  }

  /**
   * Set polygon geometries.
   *
   * @param map
   */
  setPolygonGeometries(map) {
    map.addLayer({
      id: `${this.options.id}-polygon`,
      type: 'fill',
      source: this.options.id,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['string', ['get', 'fill'], backgroundColor],
        'fill-opacity': ['number', ['get', 'fill-opacity'], 1.0],
        'fill-outline-color': ['string', ['get', 'stroke'], strokeColor],
      },
    });

    this.setPopup(map, `${this.options.id}-polygon`);
  }

  /**
   * Set line geometries.
   *
   * @param map
   */
  setLineGeometries(map) {
    map.addLayer({
      id: `${this.options.id}-linestring`,
      type: 'line',
      source: this.options.id,
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

    this.setPopup(map, `${this.options.id}-linestring`);
  }

  /**
   * Setup point geometries.
   *
   * @param map
   */
  setPointGeometries(map) {
    map.addLayer({
      id: 'circle-simple-style-points',
      type: 'circle',
      source: `${this.options.id}-points`,
      filter: ['!', ['has', 'point_count']],
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
      id: `${this.options.id}-symbol-points`,
      type: 'symbol',
      source: `${this.options.id}-points`,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'text-color': ['string', ['get', 'text-color'], textColor],
        'text-halo-color': ['string', ['get', 'text-halo-color'], textHaloColor],
        'text-halo-width': 1,
      },
      layout: {
        'icon-image': [
          'case',
          ['==', 'large', ['get', 'marker-size']], ['image', ['concat', ['get', 'marker-symbol'], '-15']],
          ['image', ['concat', ['get', 'marker-symbol'], '-11']],
        ],
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

    this.setPopup(map, 'circle-simple-style-points');
  }

  setPopup(map, source) {
    map.on('click', source, (e) => {
      const center = turfCenter(e.features[0]).geometry.coordinates;
      const description = e.features[0].properties.description;

      if (description) {
        new maplibregl.Popup().setLngLat(center).setHTML(sanitizeHtml(description)).addTo(map);
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

  /**
   * Setup cluster markers
   *
   * @param map
   */
  setCluster(map) {
    map.addLayer({
      id: `${this.options.id}-clusters`,
      type: 'circle',
      source: `${this.options.id}-points`,
      filter: ['has', 'point_count'],
      paint: {
        'circle-radius': 20,
        'circle-color': this.options.clusterColor,
        'circle-opacity': 1.0,
      },
    });

    map.addLayer({
      id: `${this.options.id}-cluster-count`,
      type: 'symbol',
      source: `${this.options.id}-points`,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 14,
        'text-font': ['Noto Sans Regular'],
      },
    });

    map.on('click', `${this.options.id}-clusters`, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [`${this.options.id}-clusters`] });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('geolonia-simple-style-points').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err)
          return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
    });

    map.on('mouseenter', `${this.options.id}-clusters`, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `${this.options.id}-clusters`, () => {
      map.getCanvas().style.cursor = '';
    });
  }
}

export default SimpleStyle;
