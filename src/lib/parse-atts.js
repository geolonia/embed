'use strict'

import * as util from './util'

export default container => {
  if (!container.dataset) {
    container.dataset = {}
  }

  let lang = 'auto'
  if (container.dataset.lang && 'auto' === container.dataset.lang) {
    lang = util.getLang()
  } else if (container.dataset.lang && 'ja' === container.dataset.lang) {
    lang = 'ja'
  } else if (container.dataset.lang && 'ja' !== container.dataset.lang) {
    lang = 'en'
  } else {
    lang = util.getLang()
  }

  return {
    lat: 0,
    lng: 0,
    zoom: 0,
    bearing: 0,
    pitch: 0,
    hash: 'off',
    marker: 'on',
    markerColor: '#E4402F',
    openPopup: 'off',
    customMarker: '',
    customMarkerOffset: '0, 0',
    gestureHandling: 'on',
    navigationControl: 'on',
    geolocateControl: 'off',
    fullscreenControl: 'off',
    scaleControl: 'off',
    geojson: '',
    cluster: 'on',
    clusterColor: '#ff0000',
    style: 'geolonia/basic',
    lang: lang,
    plugin: 'off',
    key: window.geolonia.config.ACCESS_TOKEN,
    apiUrl: window.geolonia.config.API_URL,
    loader: 'on',
    minZoom: '',
    maxZoom: 20,
    '3d': '',
    ...container.dataset,
  }
}
