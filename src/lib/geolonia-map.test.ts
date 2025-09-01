import assert from 'assert';
import sinon from 'sinon';
import {JSDOM} from 'jsdom';

// MapLibre GL 全体をモック
const mockMapInstance = {
  addControl: sinon.spy(),
  removeControl: sinon.spy(),
  on: sinon.spy(),
  off: sinon.spy(),
  addSource: sinon.spy(),
  addLayer: sinon.spy(),
};

const maplibregl = {
  Map: sinon.stub().returns(mockMapInstance),
  NavigationControl: sinon.stub(),
  GeolocateControl: sinon.stub(),
  FullscreenControl: sinon.stub(),
  ScaleControl: sinon.stub(),
  Marker: sinon.stub().returns({
    setLngLat: sinon.stub().returnsThis(),
    addTo: sinon.stub().returnsThis(),
    remove: sinon.stub().returnsThis(),
    setPopup: sinon.stub().returnsThis(),
    getElement: sinon.stub().returns(document.createElement('div')),
  }),
  Popup: sinon.stub().returns({
    setLngLat: sinon.stub().returnsThis(),
    setHTML: sinon.stub().returnsThis(),
    addTo: sinon.stub().returnsThis(),
    remove: sinon.stub().returnsThis(),
  }),
};
const SimpleStyle = sinon.stub().returns({
  addTo: sinon.stub().returnsThis(),
});
const SimpleStyleVector = sinon.stub().returns({
  addTo: sinon.stub().returnsThis(),
});

import {keyring} from './keyring';

describe('GeoloniaMap constructor options', () => {
  let dom: JSDOM;
  let mapStub: sinon.SinonStub;
  let markerStub: sinon.SinonStub;
  let simpleStyleStub: sinon.SinonStub;
  let simpleStyleVectorStub: sinon.SinonStub;
  let GeoloniaMap: any;

  let originalRequireCache: any;

  before(async () => {
    // 元のcacheを保存
    originalRequireCache = {
      'maplibre-gl': require.cache[require.resolve('maplibre-gl')],
      './geolonia-marker': require.cache[require.resolve('./geolonia-marker')],
      './simplestyle': require.cache[require.resolve('./simplestyle')],
      './simplestyle-vector': require.cache[require.resolve('./simplestyle-vector')],
    };

    // モックを設定
    require.cache[require.resolve('maplibre-gl')] = {exports: maplibregl} as any;
    require.cache[require.resolve('./geolonia-marker')] = {exports: maplibregl.Marker} as any;
    require.cache[require.resolve('./simplestyle')] = {exports: {SimpleStyle}} as any;
    require.cache[require.resolve('./simplestyle-vector')] = {exports: SimpleStyleVector} as any;

    GeoloniaMap = (await import('./geolonia-map')).default;
  });

  beforeEach(() => {
    sinon.resetHistory();
    mapStub = maplibregl.Map as sinon.SinonStub;
    markerStub = maplibregl.Marker as sinon.SinonStub;
    simpleStyleStub = SimpleStyle as sinon.SinonStub;
    simpleStyleVectorStub = SimpleStyleVector as sinon.SinonStub;

    // DOM環境をセットアップ
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    (global as any).window = dom.window;
    (global as any).document = dom.window.document;

    // Keyringをリセット
    keyring.reset();
    keyring.apiKey = 'test-api';
  });

  afterEach(() => {
    keyring.reset();
  });

  after(() => {
    // 元のcacheを復元
    Object.keys(originalRequireCache).forEach((key) => {
      if (originalRequireCache[key]) {
        require.cache[require.resolve(key)] = originalRequireCache[key];
      } else {
        delete require.cache[require.resolve(key)];
      }
    });
    sinon.restore();
  });

  it('should pass basic position attributes to MapLibre constructor', () => {
    dom.window.document.body.innerHTML = `
      <div class="geolonia"
           data-lat="35.681236"
           data-lng="139.767125"
           data-zoom="16"
           data-bearing="45"
           data-pitch="60"
           style="height: 400px;">
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});

    const [options] = mapStub.getCall(0).args;
    assert.equal(options.center[0], 139.767125, 'longitude should be passed correctly');
    assert.equal(options.center[1], 35.681236, 'latitude should be passed correctly');
    assert.equal(options.zoom, 16, 'zoom should be passed correctly');
    assert.equal(options.bearing, 45, 'bearing should be passed correctly');
    assert.equal(options.pitch, 60, 'pitch should be passed correctly');
  });

  it('should pass hash attribute to MapLibre constructor', () => {
    dom.window.document.body.innerHTML = `
      <div class="geolonia" data-hash="on" style="height: 400px;"></div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});

    const [options] = mapStub.getCall(0).args;
    assert.equal(options.hash, true, 'hash="on" should be converted to true');
  });

  it('should merge constructor params with div attributes', () => {
    dom.window.document.body.innerHTML = `
      <div class="geolonia"
           data-lat="35.681236"
           data-lng="139.767125"
           data-zoom="10"
           style="height: 400px;">
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;

    new GeoloniaMap({
      container,
      zoom: 15, // data-zoom="10" を上書き
      pitch: 45, // 新しい属性を追加
    });

    const [options] = mapStub.getCall(0).args;
    assert.equal(options.zoom, 15, 'constructor params should override div attributes');
    assert.equal(options.pitch, 45, 'constructor params should add new properties');
    assert.equal(options.center[0], 139.767125, 'non-overridden attributes should be preserved');
    assert.equal(options.center[1], 35.681236, 'non-overridden attributes should be preserved');
  });

  it('should pass marker attributes to MapLibre Marker constructor', () => {
    dom.window.document.body.innerHTML = `
      <div class="geolonia"
           data-lat="35.681236"
           data-lng="139.767125"
           data-marker-color="#555555"
           style="height: 400px;">Hello
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const loadCallback = mockMapInstance.on.getCalls().find((call) => call.args[0] === 'load')?.args[1];
    assert(loadCallback, 'Map load event listener should be registered');
    loadCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(markerStub.calledOnce, 'Marker constructor should be called once');
    const [markerOptions] = markerStub.getCall(0).args;
    assert.deepEqual(markerOptions, {color: '#555555'}, 'Marker options should include color from data-marker-color');
    const markerInstance = markerStub.getCall(0).returnValue;
    assert(markerInstance.setLngLat.calledWith([139.767125, 35.681236]), 'Marker position should be set correctly');

    const popupInstance = maplibregl.Popup.getCall(0).returnValue;
    assert(popupInstance.setHTML.calledWith('Hello'), 'Popup HTML should be set from div content');
    assert(markerInstance.setPopup.calledWith(popupInstance), 'Popup should be associated with Marker');
  });

  it('should pass custom marker element', () => {
    dom.window.document.body.innerHTML = `
      <div>
        <div id="custom-marker">><img src="./icon.png" alt=""></div>
        <div class="geolonia"
           data-lat="35.681236"
           data-lng="139.767125"
           data-custom-marker="#custom-marker"
           data-custom-marker-offset="0, -25"
           style="height: 400px;">
           <h3>Hello World!</h3>
        </div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const loadCallback = mockMapInstance.on.getCalls().find((call) => call.args[0] === 'load')?.args[1];
    assert(loadCallback, 'Map load event listener should be registered');
    loadCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(markerStub.calledOnce, 'Marker constructor should be called once');
    const [markerOptions] = markerStub.getCall(0).args;
    assert(markerOptions['element'], 'Marker options should include custom marker element');
    assert(markerOptions['element'].id === 'custom-marker');
    assert.deepEqual(markerOptions['offset'], [0, -25], 'Marker options should include offset from data-custom-marker-offset');
  });

  it('should pass GeoJSON with SimpleStyle', () => {
    const geoJSON = {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [
              139.767125,
              35.681236,
            ],
          },
          'properties': {
            'title': 'Tokyo Station',
            'marker-size': 'large',
            'marker-color': '#ff0000',
            'marker-symbol': 'rail-metro',
          },
        },
      ],
    };
    dom.window.document.body.innerHTML = `
      <script type="application/json" id="example-geojson">${JSON.stringify(geoJSON)}</script>
      <div>
        <div class="geolonia"
            data-geojson="#example-geojson"
            data-marker="off"
        ></div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const styledataCallback = mockMapInstance.on.getCalls()
      .find((call) => call.args[0] === 'styledata')?.args[1];
    assert(styledataCallback, 'Map load event listener should be registered');
    styledataCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(simpleStyleStub.calledOnce, 'SimpleStyle constructor should be called once');
    const [geojsonArg] = simpleStyleStub.getCall(0).args;
    assert.deepEqual(geojsonArg, geoJSON, 'GeoJSON passed to SimpleStyle should match the input');
  });

  it('should pass GeoJSON URL with SimpleStyle', () => {
    const url = 'https://embed.geolonia.test.com/data.geojson';
    dom.window.document.body.innerHTML = `
      <div>
        <div class="geolonia"
            data-geojson="${url}"
            data-marker="off"
        ></div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const styledataCallback = mockMapInstance.on.getCalls()
      .find((call) => call.args[0] === 'styledata')?.args[1];
    assert(styledataCallback, 'Map load event listener should be registered');
    styledataCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(simpleStyleStub.calledOnce, 'SimpleStyle constructor should be called once');
    const [geojsonArg] = simpleStyleStub.getCall(0).args;
    assert.deepEqual(geojsonArg, url, 'GeoJSON passed to SimpleStyle should match the input');
  });

  it('should pass simple-vector with SimpleStyle', () => {
    const url = 'https://embed.geolonia.test.com/embed-simple-vector-sample/tiles.json';
    dom.window.document.body.innerHTML = `
      <div>
        <div class="geolonia"
            data-simple-vector="${url}"
            data-marker="off"
        ></div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const styledataCallback = mockMapInstance.on.getCalls()
      .find((call) => call.args[0] === 'styledata')?.args[1];
    assert(styledataCallback, 'Map load event listener should be registered');
    styledataCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(simpleStyleVectorStub.calledOnce, 'SimpleStyleVector constructor should be called once');
    const [urlArg] = simpleStyleVectorStub.getCall(0).args;
    assert.deepEqual(urlArg, url, 'url passed to SimpleStyleVector should match the input');
  });

  it('should pass simple-vector with geolonia:// schema', () => {
    const url = 'geolonia://embed-simple-vector-sample/tiles.json';
    dom.window.document.body.innerHTML = `
      <div>
        <div class="geolonia"
            data-simple-vector="${url}"
            data-marker="off"
        ></div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const styledataCallback = mockMapInstance.on.getCalls()
      .find((call) => call.args[0] === 'styledata')?.args[1];
    assert(styledataCallback, 'Map load event listener should be registered');
    styledataCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(simpleStyleVectorStub.calledOnce, 'SimpleStyleVector constructor should be called once');
    const [urlArg] = simpleStyleVectorStub.getCall(0).args;
    assert.deepEqual(urlArg, url, 'url passed to SimpleStyleVector should match the input');
  });

  it('should pass simple-vector with tileId', () => {
    const tileId = '2743bbe4da254ab2b6a6477129203d60';
    dom.window.document.body.innerHTML = `
      <div>
        <div class="geolonia"
            data-simple-vector="${tileId}"
            data-marker="off"
        ></div>
      </div>
    `;

    const container = dom.window.document.querySelector('.geolonia') as HTMLElement;
    new GeoloniaMap({container});
    const styledataCallback = mockMapInstance.on.getCalls()
      .find((call) => call.args[0] === 'styledata')?.args[1];
    assert(styledataCallback, 'Map load event listener should be registered');
    styledataCallback({target: mockMapInstance}); // 'load' イベントを手動でトリガー

    assert(simpleStyleVectorStub.calledOnce, 'SimpleStyleVector constructor should be called once');
    const [urlArg] = simpleStyleVectorStub.getCall(0).args;
    assert.deepEqual(urlArg,
      `geolonia://tiles/custom/${tileId}`,
      'url passed to SimpleStyleVector should match the input with geolonia schema',
    );
  });
});
