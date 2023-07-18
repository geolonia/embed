import parseAtts from './parse-atts';
import assert from 'assert';
import { JSDOM } from 'jsdom';
import { keyring } from './keyring';

describe('tests for parse Attributes', () => {

  const prevWindow = global.window;

  beforeEach(() => {
    global.window = {
      // @ts-ignore forcefully assigning values to readonly properties
      navigator: { languages: ['ja'] },
    };

    keyring.reset();
  });

  it('should parse attribute', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
          <script type="text/javascript" src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
          </body></html>`).window;

    const atts = parseAtts(mocDocument);
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
      geoloniaControl: 'on',
      geojson: '',
      simpleVector: '',
      cluster: 'on',
      clusterColor: '#ff0000',
      style: 'geolonia/basic-v1',
      lang: 'ja',
      plugin: 'off',
      key: 'YOUR-API-KEY',
      apiUrl: 'https://api.geolonia.com/v1',
      stage: 'v1',
      loader: 'on',
      minZoom: '',
      maxZoom: 20,
      '3d': '',
    });
  });

  afterEach(() => {
    global.window = prevWindow;
    keyring.reset();
  });
});
