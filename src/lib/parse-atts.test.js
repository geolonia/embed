import parseAtts from './parse-atts'
import assert from 'assert'
import { JSDOM } from 'jsdom'

describe('tests for parse Attributes', () => {

  let prevWindow = global.window

  beforeEach(() => {
    global.window = {
      geolonia: { config: {} },
      navigator: { languages: ['ja'] },
    }
  })

  it('should parse attribute', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
          <script type="text/javascript" src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
          </body></html>`).window

    const atts = parseAtts(mocDocument)
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
      key: 'YOUR-API-KEY',
      apiUrl: 'https://api.geolonia.com/v1',
      loader: 'on',
      minZoom: '',
      maxZoom: 20,
      baseTilesVersion: '',
      '3d': '',
    })
  })

  afterEach(() => {
    global.window = prevWindow
  })
})
