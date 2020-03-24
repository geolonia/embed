/**
 * All properties should have prefix `user_`.
 * See https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
 */

export default [
  {
    id: 'draw-polygon',
    type: 'fill',
    filter: ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'fill-color': ['string', ['get', 'user_fill'], '#7e7e7e'],
      'fill-opacity': [
        'case',
        ['==', ['get', 'active'], 'true'], 0.4,
        ['number', ['get', 'user_fill-opacity'], 1.0],
      ],
      'fill-outline-color': [
        'case',
        ['==', ['get', 'active'], 'true'], '#ff6600',
        ['string', ['get', 'user_stroke'], '#555555'],
      ],
    },
  },
  {
    id: 'draw-linestring',
    type: 'line',
    filter: ['all',
      ['==', '$type', 'LineString'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'line-width': ['number', ['get', 'user_stroke-width'], 1],
      'line-color': [
        'case',
        ['==', ['get', 'active'], 'true'], '#ff6600',
        ['string', ['get', 'user_stroke'], '#555555'],
      ],
      'line-opacity': [
        'case',
        ['==', ['get', 'active'], 'true'], 0.4,
        ['number', ['get', 'user_stroke-opacity'], 1.0],
      ],
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  },
  {
    id: 'draw-active-points',
    type: 'circle',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'circle-radius': [
        'case',
        ['==', 'small', ['get', 'user_marker-size']], 3,
        ['==', 'large', ['get', 'user_marker-size']], 13,
        9,
      ],
      'circle-color': ['string', ['get', 'user_marker-color'], '#7e7e7e'],
      'circle-opacity': [
        'case',
        ['==', ['get', 'active'], 'true'], 0.4,
        ['number', ['get', 'user_fill-opacity'], 1.0],
      ],
      'circle-stroke-width': ['number', ['get', 'user_stroke-width'], 2],
      'circle-stroke-color': [
        'case',
        ['==', ['get', 'active'], 'true'], '#ff6600',
        ['string', ['get', 'user_stroke'], '#555555'],
      ],
      'circle-stroke-opacity': ['number', ['get', 'user_stroke-opacity'], 1.0],
    },
  },
  {
    id: 'draw-linestring-symbol',
    type: 'symbol',
    filter: ['all',
      ['==', '$type', 'LineString'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'text-color': '#000000',
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': 1,
    },
    layout: {
      'symbol-placement': 'line',
      'text-field': [
        'case',
        ['==', ['get', 'active'], 'true'], '',
        ['==', ['get', 'active'], 'false'], ['get', 'user_title'],
        ''
      ],
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-max-width': 12,
      'text-allow-overlap': false,
    },
  },
  {
    id: 'draw-polygon-symbol',
    type: 'symbol',
    filter: ['all',
      ['==', '$type', 'Polygon'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'text-color': '#000000',
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': 1,
    },
    layout: {
      'text-field': [
        'case',
        ['==', ['get', 'active'], 'false'], ['get', 'user_title'],
        ''
      ],
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-max-width': 12,
      'text-offset': [0, 0],
      'text-allow-overlap': false,
    },
  },
  {
    id: 'draw-point-symbol',
    type: 'symbol',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature']
    ],
    paint: {
      'text-color': '#333333',
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': 1,
    },
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'active'], 'false'], ['concat', ['get', 'user_marker-symbol'], '-11'],
        ''
      ],
      'text-field': [
        'case',
        ['==', ['get', 'active'], 'false'], ['get', 'user_title'],
        ''
      ],
      'text-font': ['Noto Sans Regular'],
      'text-size': 12,
      'text-anchor': 'top',
      'text-max-width': 12,
      'text-offset': [
        'case',
        ['==', 'small', ['get', 'user_marker-size']], ['literal', [0, 0.4]],
        ['==', 'large', ['get', 'user_marker-size']], ['literal', [0, 1.2]],
        ['literal', [0, 1]],
      ],
      'text-allow-overlap': false,
    },
  }
]
