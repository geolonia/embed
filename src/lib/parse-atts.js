'use strict'

import parseApiKey from './parse-api-key'
import * as util from './util'

export default (container, params = {}) => {
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

  const { key, stage } = parseApiKey(container)

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
    gestureHandling: false === params.interactive ? 'off' : 'on',
    navigationControl: false === params.interactive ? 'off' : 'on',
    geolocateControl: 'off',
    fullscreenControl: 'off',
    scaleControl: 'off',
    geoloniaControl: 'on',
    geojson: '',
    cluster: 'on',
    clusterColor: '#ff0000',
    style: 'geolonia/basic',
    lang: lang,
    plugin: 'off',
    key: key,
    apiUrl: `https://api.geolonia.com/${stage}`,
    loader: 'on',
    minZoom: '',
    maxZoom: 20,
    baseTilesVersion: '',
    '3d': '',
    ...container.dataset,
  }
}
