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
  }),
};

// require.cache を使って モックを注入
require.cache[require.resolve('maplibre-gl')] = {
  exports: maplibregl,
} as any;
require.cache[require.resolve('./geolonia-marker')] = {
  exports: maplibregl.Marker,
} as any;

import GeoloniaMap from './geolonia-map';
import {keyring} from './keyring';

describe('GeoloniaMap constructor options', () => {
  let dom: JSDOM;
  let mapStub: sinon.SinonStub;
  let markerStub: sinon.SinonStub;

  beforeEach(() => {
    mapStub = maplibregl.Map as sinon.SinonStub;
    markerStub = maplibregl.Marker as sinon.SinonStub;
    mapStub.resetHistory();
    markerStub.resetHistory();

    // DOM環境をセットアップ
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

    // Keyringをリセット
    keyring.reset();
    keyring.apiKey = 'test-api';
  });

  afterEach(() => {
    keyring.reset();
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
});
