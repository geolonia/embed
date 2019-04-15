'use strict'

import _ from 'lodash'
import mapboxgl from 'mapbox-gl'

class simpleStyle {
  constructor(json) {
    this.json = json

    this.defaults = {
      title: '',
      description: '',
      'marker-size': 'medium',
      'marker-symbol': '',
      'marker-color': '#7e7e7e',
      stroke: '#555555',
      'stroke-opacity': 1.0,
      'stroke-width': 2,
      fill: '#7e7e7e',
      'fill-opacity': 0.6,
      minzoom: 0,
      maxzoom: 22,
    }
  }

  addTo(map) {
    const features = this.json.features
    for (let i = 0; i < features.length; i++) {
      const properties = { ...this.defaults, ...features[i].properties }
      features[i].properties = properties
    }

    this.setPolygonGeometries(map, features)
    this.setLineGeometries(map, features)
    this.setPointGeometries(map, features)
  }

  /**
   * Set line geometries.
   *
   * @param map
   * @param features
   */
  setPolygonGeometries(map, features) {
    const polygon = _.filter(features, feature => {
      if (feature.geometry && feature.geometry.type && 'polygon' === feature.geometry.type.toLowerCase()) {
        return true
      }
    })

    map.addSource('simple-style-polygons', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygon,
      },
    })

    map.addLayer({
      id: 'polygon-simple-style-simple-style-polygons',
      type: 'fill',
      source: 'simple-style-polygons',
      paint: {
        'fill-color': ['get', 'fill'],
        'fill-opacity': ['to-number', ['get', 'fill-opacity']],
        'fill-outline-color': ['get', 'stroke'],
      },
    })
  }

  /**
   * Set line geometries.
   *
   * @param map
   * @param features
   */
  setLineGeometries(map, features) {
    const lines = _.filter(features, feature => {
      if (feature.geometry && feature.geometry.type && 'linestring' === feature.geometry.type.toLowerCase()) {
        return true
      }
    })

    map.addSource('simple-style-lines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: lines,
      },
    })

    map.addLayer({
      id: 'line-simple-style-lines',
      type: 'line',
      source: 'simple-style-lines',
      paint: {
        'line-width': ['to-number', ['get', 'stroke-width']],
        'line-color': ['get', 'stroke'],
        'line-opacity': ['to-number', ['get', 'stroke-opacity']],
      },
    })
  }

  /**
   * Setup point geometries.
   *
   * @param map
   * @param features
   */
  setPointGeometries(map, features) {
    const points = _.filter(features, feature => {
      if (feature.geometry && feature.geometry.type && 'point' === feature.geometry.type.toLowerCase()) {
        return true
      }
    })

    map.addSource('simple-style-points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: points,
      },
    })

    map.addLayer({
      id: 'circle-simple-style-points',
      type: 'circle',
      source: 'simple-style-points',
      paint: {
        'circle-radius': [
          'case',
          ['==', 'small', ['get', 'marker-size']], 3,
          ['==', 'large', ['get', 'marker-size']], 11,
          7,
        ],
        'circle-color': ['get', 'marker-color'],
        'circle-opacity': ['to-number', ['get', 'fill-opacity']],
        'circle-stroke-width': ['to-number', ['get', 'stroke-width']],
        'circle-stroke-color': ['get', 'stroke'],
        'circle-stroke-opacity': ['to-number', ['get', 'stroke-opacity']],
      },
    })

    map.addLayer({
      id: 'symbol-simple-style-points',
      type: 'symbol',
      source: 'simple-style-points',
      paint: {
        'text-color': '#000000',
        'text-halo-color': 'rgba(255, 255, 255, 1)',
        'text-halo-width': 2,
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
          ['==', 'small', ['get', 'marker-size']], ['literal', [0, 0.4]],
          ['==', 'large', ['get', 'marker-size']], ['literal', [0, 1]],
          ['literal', [0, 0.8]],
        ],
        'text-allow-overlap': false,
      },
    })

    map.on('click', 'circle-simple-style-points', e => {
      const coordinates = e.features[0].geometry.coordinates.slice()
      const description = e.features[0].properties.description

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      if (description) {
        new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map)
      }
    })

    map.on('mouseenter', 'circle-simple-style-points', e => {
      if (e.features[0].properties.description) {
        map.getCanvas().style.cursor = 'pointer'
      }
    })

    map.on('mouseleave', 'circle-simple-style-points', () => {
      map.getCanvas().style.cursor = ''
    })
  }
}

export default simpleStyle
