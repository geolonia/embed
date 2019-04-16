'use strict'

import parseApiKey from './parse-api-key'

export default container => {
  return {
    lat: 0,
    lng: 0,
    zoom: 0,
    bearing: 0,
    pitch: 0,
    hash: 'off',
    marker: 'on',
    openPopup: 'off',
    customMarker: null,
    gestureHandling: 'on',
    navigationControl: 'on',
    geolocateControl: 'off',
    fullscreenControl: 'off',
    scaleControl: 'off',
    geojson: null,
    cluster: true,
    clusterColor: '#ff0000',
    style: 'osm-bright',
    key: parseApiKey(document),
    ...container.dataset,
  }
}
