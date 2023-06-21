'use strict';

import { parseApiKey } from './parse-api-key';
import * as util from './util';

type ParseAttsParams = {
  interactive?: boolean;
}

export default (container, params: ParseAttsParams = {}) => {
  if (!container.dataset) {
    container.dataset = {};
  }

  let lang = 'auto';
  if (container.dataset.lang && container.dataset.lang === 'auto') {
    lang = util.getLang();
  } else if (container.dataset.lang && container.dataset.lang === 'ja') {
    lang = 'ja';
  } else if (container.dataset.lang && container.dataset.lang !== 'ja') {
    lang = 'en';
  } else {
    lang = util.getLang();
  }

  const { key, stage } = parseApiKey(container);

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
    gestureHandling: params.interactive === false ? 'off' : 'on',
    navigationControl: params.interactive === false ? 'off' : 'on',
    geolocateControl: 'off',
    fullscreenControl: 'off',
    scaleControl: 'off',
    geoloniaControl: 'on',
    geojson: '',
    simpleVector: '',
    cluster: 'on',
    clusterColor: '#ff0000',
    style: 'geolonia/basic-v1',
    lang: lang,
    plugin: 'off',
    key: key,
    apiUrl: `https://api.geolonia.com/${stage}`,
    stage,
    loader: 'on',
    minZoom: '',
    maxZoom: 20,
    '3d': '',
    ...container.dataset,
  };
};
