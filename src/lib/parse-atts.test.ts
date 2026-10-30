import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { keyring, getStyle } from '@geolonia/maps-core';
import parseAtts, { attsToOptions } from './parse-atts';

/**
 * parse-atts is the embed-specific "wrapper" layer: it reads `data-*`
 * attributes off a container and (a) exposes them to plugins as
 * `EmbedAttributes` and (b) converts them into a typed `GeoloniaMapOptions`
 * for maps-core via `attsToOptions()`.
 */
describe('parseAtts', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('YOUR-API-KEY');
    keyring.setStage('v1');
    // navigator.languages is read-only; force a deterministic language.
    Object.defineProperty(window.navigator, 'languages', {
      value: ['ja'],
      configurable: true,
    });
  });

  afterEach(() => {
    keyring.reset();
  });

  it('returns default EmbedAttributes merged with keyring key/stage', () => {
    const container = document.createElement('div');

    const atts = parseAtts(container);

    expect(atts).toEqual({
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
      style: 'geolonia/basic-v2',
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

  it('overrides defaults with data-* attributes', () => {
    const container = document.createElement('div');
    container.dataset.lat = '35';
    container.dataset.lng = '139';
    container.dataset.zoom = '10';
    container.dataset.marker = 'off';

    const atts = parseAtts(container);

    expect(atts.lat).toBe('35');
    expect(atts.lng).toBe('139');
    expect(atts.zoom).toBe('10');
    expect(atts.marker).toBe('off');
  });

  it('forces gestureHandling/navigationControl off when non-interactive', () => {
    const container = document.createElement('div');
    const atts = parseAtts(container, { interactive: false });
    expect(atts.gestureHandling).toBe('off');
    expect(atts.navigationControl).toBe('off');
  });
});

describe('attsToOptions', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('YOUR-API-KEY');
    keyring.setStage('v1');
    Object.defineProperty(window.navigator, 'languages', {
      value: ['ja'],
      configurable: true,
    });
  });

  afterEach(() => {
    keyring.reset();
  });

  it('converts on/off flags into typed GeoloniaMapOptions', () => {
    const container = document.createElement('div');
    container.dataset.hash = 'on';
    container.dataset.marker = 'off';
    container.dataset['3d'] = 'on';

    const options = attsToOptions(container, parseAtts(container));

    expect(options.container).toBe(container);
    expect(options.hash).toBe(true);
    expect(options.marker).toBe(false);
    expect(options['3d']).toBe(true);
    expect(options.style).toBe('geolonia/basic-v2');
    expect(options.apiKey).toBe('YOUR-API-KEY');
    expect(options.stage).toBe('v1');
  });

  it('maps control positions and on/off to boolean | ControlPosition', () => {
    const container = document.createElement('div');
    container.dataset.navigationControl = 'top-right';
    container.dataset.geolocateControl = 'on';
    container.dataset.scaleControl = 'off';

    const options = attsToOptions(container, parseAtts(container));

    expect(options.navigationControl).toBe('top-right');
    expect(options.geolocateControl).toBe(true);
    expect(options.scaleControl).toBe(false);
  });

  it('sets center only when both data-lat and data-lng are present', () => {
    const withCoords = document.createElement('div');
    withCoords.dataset.lat = '35';
    withCoords.dataset.lng = '139';
    expect(attsToOptions(withCoords, parseAtts(withCoords)).center).toEqual([
      139, 35,
    ]);

    const withoutCoords = document.createElement('div');
    expect(attsToOptions(withoutCoords, parseAtts(withoutCoords)).center).toBe(
      undefined,
    );
  });

  it('parses customMarkerOffset and zoom bounds', () => {
    const container = document.createElement('div');
    container.dataset.customMarkerOffset = '10, -5';
    container.dataset.minZoom = '3';
    container.dataset.maxZoom = '18';

    const options = attsToOptions(container, parseAtts(container));

    expect(options.customMarkerOffset).toEqual([10, -5]);
    expect(options.minZoom).toBe(3);
    expect(options.maxZoom).toBe(18);
  });

  it('honours data-max-zoom="0" (0 is a valid bound, not falsy)', () => {
    const container = document.createElement('div');
    container.dataset.minZoom = '0';
    container.dataset.maxZoom = '0';

    const options = attsToOptions(container, parseAtts(container));

    expect(options.minZoom).toBe(0);
    expect(options.maxZoom).toBe(0);
  });
});

// data-choropleth / data-heatmap / data-circle-* (embed#546 / maps-core#156)。
describe('attsToOptions のデータ駆動の描き方', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('YOUR-API-KEY');
    keyring.setStage('v1');
  });

  afterEach(() => {
    keyring.reset();
  });

  const toOptions = (dataset: Record<string, string>) => {
    const container = document.createElement('div');
    Object.assign(container.dataset, dataset);
    return attsToOptions(container, parseAtts(container));
  };

  it('属性が無ければ choropleth / heatmap / circle を渡さない', () => {
    const options = toOptions({});

    expect(options.choropleth).toBe(undefined);
    expect(options.heatmap).toBe(undefined);
    expect(options.circle).toBe(undefined);
  });

  it('data-choropleth はプロパティ名だけを渡す', () => {
    expect(toOptions({ choropleth: 'value' }).choropleth).toEqual({
      property: 'value',
    });
  });

  it('data-choropleth-colors と data-choropleth-range を読む', () => {
    const options = toOptions({
      choropleth: 'value',
      choroplethColors: '#ffffff, #ff0000',
      choroplethRange: '0, 100',
    });

    expect(options.choropleth).toEqual({
      property: 'value',
      colors: ['#ffffff', '#ff0000'],
      range: [0, 100],
    });
  });

  it('色の区切りは括弧の中のカンマを区切りとして扱わない', () => {
    const options = toOptions({
      choropleth: 'value',
      choroplethColors:
        'rgb(255, 255, 255),rgba(255, 0, 0, 0.5) , hsl(0, 100%, 50%)',
    });

    expect(options.choropleth).toEqual({
      property: 'value',
      colors: [
        'rgb(255, 255, 255)',
        'rgba(255, 0, 0, 0.5)',
        'hsl(0, 100%, 50%)',
      ],
    });
  });

  it('読めない data-choropleth-range は無視する', () => {
    for (const range of ['abc', '1', '1,2,3', '1,x', '', '100,0', '5,5']) {
      expect(
        toOptions({ choropleth: 'value', choroplethRange: range }).choropleth,
      ).toEqual({ property: 'value' });
    }
  });

  it('data-choropleth が無ければ -colors と -range は無視する', () => {
    const options = toOptions({
      choroplethColors: '#fff,#f00',
      choroplethRange: '0,1',
    });

    expect(options.choropleth).toBe(undefined);
  });

  it('data-heatmap="on" は重みなしのヒートマップにする', () => {
    expect(toOptions({ heatmap: 'on' }).heatmap).toEqual({});
  });

  it('data-heatmap="off" と空の値はヒートマップにしない', () => {
    expect(toOptions({ heatmap: 'off' }).heatmap).toBe(undefined);
    expect(toOptions({ heatmap: '' }).heatmap).toBe(undefined);
  });

  it('data-heatmap の on / off は大文字小文字と前後の空白を区別しない', () => {
    expect(toOptions({ heatmap: 'ON' }).heatmap).toEqual({});
    expect(toOptions({ heatmap: ' On ' }).heatmap).toEqual({});
    expect(toOptions({ heatmap: 'OFF' }).heatmap).toBe(undefined);
    expect(toOptions({ heatmap: 'Off' }).heatmap).toBe(undefined);
  });

  it('data-heatmap のプロパティ名は大文字小文字をそのまま渡す', () => {
    expect(toOptions({ heatmap: 'Weight' }).heatmap).toEqual({
      weight: 'Weight',
    });
  });

  it('data-heatmap が無ければ data-heatmap-colors は無視する', () => {
    expect(toOptions({ heatmapColors: '#ff0,#f00' }).heatmap).toBe(undefined);
  });

  it('data-heatmap にプロパティ名を書くとその値を重みにする', () => {
    expect(toOptions({ heatmap: 'weight' }).heatmap).toEqual({
      weight: 'weight',
    });
  });

  it('data-heatmap-colors を読む', () => {
    expect(
      toOptions({ heatmap: 'on', heatmapColors: '#ff0,#f00' }).heatmap,
    ).toEqual({ colors: ['#ff0', '#f00'] });
  });

  it('data-circle-size と data-circle-color と data-circle-colors を読む', () => {
    const options = toOptions({
      circleSize: 'weight',
      circleColor: 'category',
      circleColors: '#f00,#0f0,#00f',
    });

    expect(options.circle).toEqual({
      size: 'weight',
      color: 'category',
      colors: ['#f00', '#0f0', '#00f'],
    });
  });

  it('data-circle-size か data-circle-color の片方だけでも円にする', () => {
    expect(toOptions({ circleSize: 'weight' }).circle).toEqual({
      size: 'weight',
    });
    expect(toOptions({ circleColor: 'category' }).circle).toEqual({
      color: 'category',
    });
  });

  it('data-circle-colors だけでは円にしない', () => {
    expect(toOptions({ circleColors: '#f00' }).circle).toBe(undefined);
  });
});

// data-lang の言語解決 (embed#462 / maps-core#50)。
// 正しい契約 (maps-core#50 のテストが基準):
//   - `ja` / `ja-jp` のみ日本語スタイル、それ以外は英語スタイル
//   - `auto` はブラウザ言語に追従
// embed の責務: `data-lang` を options.lang へ転送する (最終的な ja/en 判定は
// maps-core の getStyle が担う)。未指定時のみ embed が getLang() で具体値に解決する。
describe('data-lang 言語解決', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('KEY');
  });
  afterEach(() => keyring.reset());

  const setNav = (langs: string[]) =>
    Object.defineProperty(window.navigator, 'languages', {
      value: langs,
      configurable: true,
    });

  const optionsFor = (dataLang: string | undefined, navLangs: string[]) => {
    setNav(navLangs);
    const c = document.createElement('div');
    if (dataLang !== undefined) c.dataset.lang = dataLang;
    return attsToOptions(c, parseAtts(c));
  };

  it('data-lang="en" は browser が ja でも英語スタイルになる (ja にならない)', () => {
    const opts = optionsFor('en', ['ja']);
    expect(opts.lang).toBe('en');
    expect(getStyle('geolonia/basic-v2', { lang: 'en', apiKey: 'KEY' })).toContain(
      '/en.json',
    );
  });

  it('data-lang="ja" は browser が en でも日本語スタイルになる', () => {
    const opts = optionsFor('ja', ['en']);
    expect(opts.lang).toBe('ja');
    expect(getStyle('geolonia/basic-v2', { lang: 'ja', apiKey: 'KEY' })).toContain(
      '/ja.json',
    );
  });

  it('data-lang="ja-jp" は日本語スタイルになる (maps-core#50)', () => {
    const opts = optionsFor('ja-jp', ['en']);
    expect(opts.lang).toBe('ja-jp');
    expect(
      getStyle('geolonia/basic-v2', { lang: 'ja-jp', apiKey: 'KEY' }),
    ).toContain('/ja.json');
  });

  it('data-lang 未指定はブラウザ言語に追従する', () => {
    expect(optionsFor(undefined, ['en']).lang).toBe('en');
    expect(optionsFor(undefined, ['ja']).lang).toBe('ja');
  });

  it('data-lang="auto" は maps-core へ委譲される (auto のまま転送)', () => {
    expect(optionsFor('auto', ['en']).lang).toBe('auto');
    expect(optionsFor('auto', ['ja']).lang).toBe('auto');
  });
});
