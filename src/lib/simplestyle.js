'use strict'

import _ from 'lodash'
import mapboxgl from 'mapbox-gl'
import geojsonExtent from '@mapbox/geojson-extent'

class simpleStyle {
  constructor(json, options) {
    this.json = json

    this.options = {
      cluster: true,
      clusterColor: '#ff0000',
      ...options,
    }
  }

  addTo(map) {
    const features = this.json.features

    const polygonandlines = _.filter(features, feature => {
      if (feature.geometry && feature.geometry.type && 'point' !== feature.geometry.type.toLowerCase()) {
        return true
      }
    })

    const points = _.filter(features, feature => {
      if (feature.geometry && feature.geometry.type && 'point' === feature.geometry.type.toLowerCase()) {
        return true
      }
    })

    map.addSource('tilecloud-simple-style', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygonandlines,
      },
    })

    /**
     * Point geometries should be separated because we want to enable cluster.
     */
    map.addSource('tilecloud-simple-style-points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: points,
      },
      cluster: this.options.cluster,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    this.setPolygonGeometries(map)
    this.setLineGeometries(map)
    this.setPointGeometries(map)

    const { lat, lng } = map.getCenter()

    if (!lng && !lat) {
      const bounds = geojsonExtent(this.json)
      map.fitBounds(bounds, {
        padding: 20,
      })
    }
  }

  /**
   * Set line geometries.
   *
   * @param map
   * @param features
   */
  setPolygonGeometries(map) {
    map.addLayer({
      id: 'tilecloud-simple-style-polygon',
      type: 'fill',
      source: 'tilecloud-simple-style',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['string', ['get', 'fill'], '#7e7e7e'],
        'fill-opacity': ['number', ['get', 'fill-opacity'], 0.6],
        'fill-outline-color': ['string', ['get', 'stroke'], '#555555'],
      },
    })
  }

  /**
   * Set line geometries.
   *
   * @param map
   * @param features
   */
  setLineGeometries(map) {
    map.addLayer({
      id: 'tilecloud-simple-style-linestring',
      type: 'line',
      source: 'tilecloud-simple-style',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-width': ['number', ['get', 'stroke-width'], 2],
        'line-color': ['string', ['get', 'stroke'], '#555555'],
        'line-opacity': ['number', ['get', 'stroke-opacity'], 1.0],
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    })
  }

  /**
   * Setup point geometries.
   *
   * @param map
   */
  setPointGeometries(map) {
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'tilecloud-simple-style-points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-radius': 20,
        'circle-color': this.options.clusterColor,
        'circle-opacity': 0.6,
      },
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'tilecloud-simple-style-points',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 14,
        'text-font': ['Noto Sans Regular'],
      },
    })

    map.addLayer({
      id: 'circle-simple-style-points',
      type: 'circle',
      source: 'tilecloud-simple-style-points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': [
          'case',
          ['==', 'small', ['get', 'marker-size']], 3,
          ['==', 'large', ['get', 'marker-size']], 11,
          7,
        ],
        'circle-color': ['string', ['get', 'marker-color'], '#7e7e7e'],
        'circle-opacity': ['number', ['get', 'fill-opacity'], 0.6],
        'circle-stroke-width': ['number', ['get', 'stroke-width'], 2],
        'circle-stroke-color': ['string', ['get', 'stroke'], '#555555'],
        'circle-stroke-opacity': ['number', ['get', 'stroke-opacity'], 1.0],
      },
    })

    map.addLayer({
      id: 'symbol-simple-style-points',
      type: 'symbol',
      source: 'tilecloud-simple-style-points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'text-color': '#000000',
        'text-halo-color': 'rgba(255, 255, 255, 1)',
        'text-halo-width': 2,
      },
      layout: {
        'icon-image': ['string', ['get', 'marker-symbol'], ''],
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

    map.on('click', 'clusters', function (e) {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      const clusterId = features[0].properties.cluster_id
      map.getSource('simple-style-points').getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err)
          return

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        })
      })
    })

    map.on('mouseenter', 'clusters', function () {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'clusters', function () {
      map.getCanvas().style.cursor = ''
    })
  }
}

export default simpleStyle
