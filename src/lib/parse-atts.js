'use strict'

import parseApiKey from './parse-api-key'

export default container => {
  if (!container.dataset) {
    container.dataset = {}
  }

  return {
    lat: 0,
    lng: 0,
    zoom: 0,
    bearing: 0,
    pitch: 0,
    hash: 'off',
    marker: 'on',
    openPopup: 'off',
    customMarker: '',
    gestureHandling: 'on',
    navigationControl: 'on',
    geolocateControl: 'off',
    fullscreenControl: 'off',
    scaleControl: 'off',
    geojson: '',
    cluster: 'on',
    clusterColor: '#ff0000',
    style: 'tilecloud-basic',
    lang: 'auto',
    key: parseApiKey(document),
    ...container.dataset,
  }
}
