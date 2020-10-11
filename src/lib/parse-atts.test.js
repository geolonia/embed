import parseAtts from './parse-atts'
import assert from 'assert'

describe('tests for parse Attributes', () => {

  let prevWindow = global.window

  beforeEach(() => {
    global.window = {
      geolonia: { config: {} },
      navigator: { languages: ['ja'] },
    }
  })

  it('should parse attribute', () => {
    const container = {
      dataset: {},
    }

    const atts = parseAtts(container)
    assert.deepStrictEqual(atts, {
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
      lang: 'ja',
      plugin: 'off',
      key: void 0,
      apiUrl: void 0,
      loader: 'on',
      minZoom: '',
      maxZoom: '',
      '3d': '',
    })
  })

  afterEach(() => {
    global.window = prevWindow
  })
})
