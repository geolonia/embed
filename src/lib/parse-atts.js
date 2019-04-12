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
    style: 'osm-bright',
    key: parseApiKey(document),
    ...container.dataset,
  }
}
