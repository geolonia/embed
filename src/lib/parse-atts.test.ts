import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { keyring, getStyle, type ChoroplethOptions } from '@geolonia/maps-core';
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

describe('-colors の値と色の組 (ColorMap)', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('YOUR-API-KEY');
    keyring.setStage('v1');
  });

  afterEach(() => {
    keyring.reset();
    vi.restoreAllMocks();
  });

  const toOptions = (dataset: Record<string, string>) => {
    const container = document.createElement('div');
    Object.assign(container.dataset, dataset);
    return attsToOptions(container, parseAtts(container));
  };
  const choroplethColors = (value: string) =>
    (
      toOptions({ choropleth: 'status', choroplethColors: value })
        .choropleth as ChoroplethOptions
    ).colors;
  const circleColors = (value: string) =>
    toOptions({ circleColor: 'status', circleColors: value }).circle?.colors;

  it('値:色 の組を対応表にする (data-choropleth-colors と data-circle-colors)', () => {
    const value = 'normal:#3b82f6, warning:#eab308, danger:#ef4444';
    const expected = {
      normal: '#3b82f6',
      warning: '#eab308',
      danger: '#ef4444',
    };
    expect(choroplethColors(value)).toEqual(expected);
    expect(circleColors(value)).toEqual(expected);
  });

  it('値: の無い色だけなら、いまどおり色の並びにする', () => {
    expect(circleColors('#f00, rgb(0, 0, 255)')).toEqual([
      '#f00',
      'rgb(0, 0, 255)',
    ]);
  });

  it('括弧の中のカンマは区切りとして扱わない', () => {
    expect(circleColors('a:rgb(0, 0, 255), b:hsl(0 100% 50% / 0.5)')).toEqual({
      a: 'rgb(0, 0, 255)',
      b: 'hsl(0 100% 50% / 0.5)',
    });
  });

  it('値に : を含められる (最後の : で値と色を分ける)', () => {
    expect(circleColors('10:30:#f00, 12:00:#00f')).toEqual({
      '10:30': '#f00',
      '12:00': '#00f',
    });
  });

  it('値と色の前後の空白を除き、: の前が空なら空文字の値にする', () => {
    expect(circleColors(' a : #f00 , : #00f ')).toEqual({
      a: '#f00',
      '': '#00f',
    });
  });

  it('数字の値は文字列のキーにする', () => {
    expect(circleColors('1:#f00, 2:#00f')).toEqual({ 1: '#f00', 2: '#00f' });
  });

  it('同じ値の組が複数あれば後のものを使う', () => {
    expect(circleColors('a:#f00, a:#00f')).toEqual({ a: '#00f' });
  });

  it('__proto__ や constructor も値として対応表に入る', () => {
    const colors = circleColors('__proto__:#f00, constructor:#00f');
    expect(Object.keys(colors ?? {})).toEqual(['__proto__', 'constructor']);
    expect(Object.entries(colors ?? {})).toEqual([
      ['__proto__', '#f00'],
      ['constructor', '#00f'],
    ]);
  });

  it('組と色だけの項目が混ざるときは、組だけを使い、ほかは警告して無視する', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(circleColors('a:#f00, #00f, b:')).toEqual({ a: '#f00' });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('data-circle-colors');
    expect(warn.mock.calls[0][0]).toContain('#00f');
    expect(warn.mock.calls[1][0]).toContain('b:');
  });

  it('閉じていない ( より後ろのカンマと : は区切りとして読まない', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // `b(:#00f, c:#0f0` が 1 つの項目になり、括弧の外に : が無いので無視される
    expect(circleColors('a:#f00, b(:#00f, c:#0f0')).toEqual({ a: '#f00' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('b(:#00f, c:#0f0');
  });

  it('使える組が 1 つも無ければ colors を渡さない (既定の色になる)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options = toOptions({
      choropleth: 'status',
      choroplethColors: 'a:, b:',
    });
    expect(options.choropleth).toEqual({ property: 'status' });
  });

  it('空の項目しか無ければ colors を渡さない', () => {
    expect(
      toOptions({ circleColor: 'status', circleColors: ' , ' }).circle,
    ).toEqual({ color: 'status' });
  });
});

// data-lang の言語解決 (embed#462 / maps-core#50 / embed#571)。
// 契約 (ラベルの言語は maps-core#50 のテストが基準):
//   - `ja` / `ja-jp` のみ日本語、それ以外は英語 (大文字と小文字を区別する)
//   - `auto` と空文字はブラウザ言語に追従 (解決するのは maps-core の GeoloniaMap のコンストラクタ)
// embed の責務: `data-lang` を maps-core の型どおり `ja` / `en` / `auto` に正規化して
// options.lang へ渡す。maps-core はこの値をジェスチャー制御にも渡し、そこは `ja` と
// `en` しか扱えないため (embed#571)。未指定時のみ embed が getLang() で具体値に解決する。
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
    expect(
      getStyle('geolonia/basic-v2', { lang: 'en', apiKey: 'KEY' }),
    ).toContain('/en.json');
  });

  it('data-lang="ja" は browser が en でも日本語スタイルになる', () => {
    const opts = optionsFor('ja', ['en']);
    expect(opts.lang).toBe('ja');
    expect(
      getStyle('geolonia/basic-v2', { lang: 'ja', apiKey: 'KEY' }),
    ).toContain('/ja.json');
  });

  it('data-lang="ja-jp" は ja に正規化して日本語スタイルになる (maps-core#50)', () => {
    const opts = optionsFor('ja-jp', ['en']);
    expect(opts.lang).toBe('ja');
    expect(
      getStyle('geolonia/basic-v2', { lang: 'ja', apiKey: 'KEY' }),
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

  it('data-lang の空文字は auto として maps-core へ委譲される', () => {
    expect(optionsFor('', ['ja']).lang).toBe('auto');
  });

  // ジェスチャー制御は ja / en 以外の値で例外になり、コントロールが付かない (embed#571)。
  it('ja / ja-jp / auto / 空文字以外の値は en に正規化する', () => {
    for (const value of ['fr', 'ja-JP', 'JA', 'AUTO', ' ja ', 'en-US']) {
      expect(optionsFor(value, ['ja']).lang).toBe('en');
    }
  });

  it('正規化後の値は maps-core の lang の型 (ja / en / auto) に収まる', () => {
    for (const value of ['ja', 'ja-jp', 'en', 'auto', '', 'fr', 'ja-JP']) {
      expect(['ja', 'en', 'auto']).toContain(optionsFor(value, ['ja']).lang);
    }
  });

  it('plugin に渡す EmbedAttributes の lang は生の値のまま', () => {
    const c = document.createElement('div');
    c.dataset.lang = 'ja-jp';
    expect(parseAtts(c).lang).toBe('ja-jp');
  });
});

// 対応外の値は console.warn を出して無視し、地図のほかのオプションは作る
// (https://github.com/geolonia/embed/issues/570)。
describe('data-geojson の解決', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const geojsonFor = (value: string) => {
    const c = document.createElement('div');
    c.dataset.geojson = value;
    return attsToOptions(c, parseAtts(c)).geojson;
  };

  const addInline = (
    attrs: { id?: string; className?: string },
    text?: string,
  ) => {
    const el = document.createElement('script');
    el.type = 'application/json';
    if (attrs.id) el.id = attrs.id;
    if (attrs.className) el.className = attrs.className;
    if (text !== undefined) el.textContent = text;
    document.body.appendChild(el);
  };

  afterEach(() => {
    document.body.innerHTML = '';
    warn.mockRestore();
  });

  const expectIgnored = (value: string) => {
    warn.mockClear();
    expect(geojsonFor(value)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('[Geolonia] data-geojson');
  };

  it('URL と相対パスは文字列のまま渡す', () => {
    for (const value of [
      'https://example.com/a.geojson',
      '/a.geojson',
      './a.geojson',
      '../a.geojson',
    ]) {
      expect(geojsonFor(value)).toBe(value);
    }
  });

  it('インライン要素を指すセレクタは中身を FeatureCollection にする', () => {
    const fc = { type: 'FeatureCollection', features: [] };
    const el = document.createElement('script');
    el.type = 'application/json';
    el.id = 'points';
    el.textContent = JSON.stringify(fc);
    document.body.appendChild(el);
    expect(geojsonFor('#points')).toEqual(fc);
  });

  // maps-core の isURL は . で始まる値を相対 URL として取得する。
  it('. で始まる値は、一致する要素があればセレクタ、無ければ相対 URL として返す', () => {
    const fc = { type: 'FeatureCollection', features: [] };
    addInline({ className: 'points' }, JSON.stringify(fc));
    expect(geojsonFor('.points')).toEqual(fc);
    expect(geojsonFor('.missing')).toBe('.missing');
    expect(warn).not.toHaveBeenCalled();
  });

  it('何も指さないセレクタは、警告を出して無視する', () => {
    expectIgnored('#missing');
  });

  it('要素の中身が FeatureCollection でないときは、警告を出して無視する', () => {
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {},
    };
    addInline({ id: 'feature' }, JSON.stringify(feature));
    addInline({ id: 'nofeatures' }, '{"type":"FeatureCollection"}');
    addInline({ id: 'null' }, 'null');
    expectIgnored('#feature');
    expectIgnored('#nofeatures');
    expectIgnored('#null');
  });

  it('インラインの JSON 文字列と ./ の無い相対パスは、警告を出して無視する', () => {
    expectIgnored('{"type":"FeatureCollection","features":[]}');
    expectIgnored('data.geojson');
  });

  it('中身が空の要素を指すセレクタは、警告を出して無視する', () => {
    addInline({ id: 'empty' });
    addInline({ className: 'empty' });
    expectIgnored('#empty');
    expectIgnored('.empty');
  });

  it('要素の中身が JSON として読めないときは、例外を投げずに警告を出して無視する (空白だけの中身を含む)', () => {
    addInline({ id: 'broken' }, '{');
    addInline({ id: 'blank' }, '\n  ');
    expectIgnored('#broken');
    expectIgnored('#blank');
  });

  it('対応外の値でも、ほかのオプションは作られる', () => {
    const c = document.createElement('div');
    c.dataset.geojson = 'data.geojson';
    c.dataset.lat = '35';
    c.dataset.lng = '139';
    c.dataset['3d'] = 'on';
    const opts = attsToOptions(c, parseAtts(c));
    expect(opts.geojson).toBeUndefined();
    expect('geojson' in opts).toBe(false);
    expect(opts.center).toEqual([139, 35]);
    expect(opts['3d']).toBe(true);
  });
});

describe('attsToOptions の投影と重ねるタイル', () => {
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

  it('属性が無ければ projection と rasterTiles を渡さない', () => {
    const options = toOptions({});

    expect('projection' in options).toBe(false);
    expect('rasterTiles' in options).toBe(false);
  });

  it('data-projection の値を前後の空白を除いて渡す', () => {
    expect(toOptions({ projection: 'globe' }).projection).toBe('globe');
    expect(toOptions({ projection: ' mercator ' }).projection).toBe('mercator');
  });

  it('data-projection の値は検査せずに渡す (maps-core がエラーを出して無視する)', () => {
    expect(toOptions({ projection: 'Globe' }).projection).toBe('Globe');
  });

  it('空の data-projection は渡さない', () => {
    expect('projection' in toOptions({ projection: '' })).toBe(false);
    expect('projection' in toOptions({ projection: '  ' })).toBe(false);
  });

  it('data-raster-tiles だけなら URL だけを渡す', () => {
    expect(
      toOptions({ rasterTiles: 'https://example.com/{z}/{x}/{y}.png' })
        .rasterTiles,
    ).toEqual({ url: 'https://example.com/{z}/{x}/{y}.png' });
  });

  it('data-raster-tiles-* をすべて読む', () => {
    expect(
      toOptions({
        rasterTiles: 'https://example.com/{z}/{x}/{y}.png',
        rasterTilesAttribution: '<a href="https://example.com/">出典</a>',
        rasterTilesOpacity: '0.7',
        rasterTilesSize: '512',
        rasterTilesMinZoom: '2',
        rasterTilesMaxZoom: '17',
      }).rasterTiles,
    ).toEqual({
      url: 'https://example.com/{z}/{x}/{y}.png',
      attribution: '<a href="https://example.com/">出典</a>',
      opacity: 0.7,
      tileSize: 512,
      minZoom: 2,
      maxZoom: 17,
    });
  });

  it('0 は数値として渡す', () => {
    expect(
      toOptions({
        rasterTiles: 'https://example.com/{z}/{x}/{y}.png',
        rasterTilesOpacity: '0',
        rasterTilesMinZoom: '0',
      }).rasterTiles,
    ).toEqual({
      url: 'https://example.com/{z}/{x}/{y}.png',
      opacity: 0,
      minZoom: 0,
    });
  });

  it('数値として読めない値と空の値は渡さない', () => {
    expect(
      toOptions({
        rasterTiles: 'https://example.com/{z}/{x}/{y}.png',
        rasterTilesAttribution: '  ',
        rasterTilesOpacity: 'half',
        rasterTilesSize: '',
        rasterTilesMinZoom: ' ',
        rasterTilesMaxZoom: 'Infinity',
      }).rasterTiles,
    ).toEqual({ url: 'https://example.com/{z}/{x}/{y}.png' });
  });

  it('範囲の外の数値は検査せずに渡す (maps-core が範囲内に収める)', () => {
    expect(
      toOptions({
        rasterTiles: 'https://example.com/{z}/{x}/{y}.png',
        rasterTilesOpacity: '1.5',
        rasterTilesSize: '-1',
      }).rasterTiles,
    ).toEqual({
      url: 'https://example.com/{z}/{x}/{y}.png',
      opacity: 1.5,
      tileSize: -1,
    });
  });

  it('data-raster-tiles が無いか空なら、ほかの data-raster-tiles-* は無視する', () => {
    const others = {
      rasterTilesAttribution: '出典',
      rasterTilesOpacity: '0.5',
      rasterTilesSize: '256',
      rasterTilesMinZoom: '2',
      rasterTilesMaxZoom: '17',
    };
    expect('rasterTiles' in toOptions(others)).toBe(false);
    expect('rasterTiles' in toOptions({ ...others, rasterTiles: ' ' })).toBe(
      false,
    );
  });
});

describe('attsToOptions の立体表示とマスク', () => {
  beforeEach(() => {
    keyring.reset();
    keyring.setApiKey('YOUR-API-KEY');
    keyring.setStage('v1');
  });

  afterEach(() => {
    keyring.reset();
    vi.restoreAllMocks();
  });

  const toOptions = (dataset: Record<string, string>) => {
    const container = document.createElement('div');
    Object.assign(container.dataset, dataset);
    return attsToOptions(container, parseAtts(container));
  };

  it('属性が無ければ extrusion と mask を渡さない', () => {
    const options = toOptions({});
    expect('extrusion' in options).toBe(false);
    expect('mask' in options).toBe(false);
  });

  it('data-extrusion だけならプロパティ名だけを渡す', () => {
    expect(toOptions({ extrusion: ' population ' }).extrusion).toBe(
      'population',
    );
  });

  it('空の data-extrusion は渡さず、ほかの data-extrusion-* も無視する', () => {
    const others = {
      extrusionMaxHeight: '1000',
      extrusionColor: 'kind',
      extrusionColors: '#f00,#00f',
    };
    expect('extrusion' in toOptions(others)).toBe(false);
    expect('extrusion' in toOptions({ ...others, extrusion: ' ' })).toBe(false);
  });

  it('data-extrusion-color だけを足すと、高さと色を別のプロパティにする', () => {
    expect(
      toOptions({ extrusion: 'population', extrusionColor: 'kind' }).extrusion,
    ).toEqual({ height: 'population', color: 'kind' });
  });

  it('data-extrusion-* をすべて読む', () => {
    expect(
      toOptions({
        extrusion: 'population',
        extrusionMaxHeight: '5000',
        extrusionHeightScale: '0.5',
        extrusionHeightRange: '0,100',
        extrusionColor: 'density',
        extrusionColors: '#fff, rgb(255, 0, 0)',
        extrusionColorRange: '10,20',
      }).extrusion,
    ).toEqual({
      height: {
        property: 'population',
        maxHeight: 5000,
        heightScale: 0.5,
        range: [0, 100],
      },
      color: {
        property: 'density',
        colors: ['#fff', 'rgb(255, 0, 0)'],
        range: [10, 20],
      },
    });
  });

  it('色のプロパティを省略して色を指定すると、高さと同じプロパティで色分けする', () => {
    expect(
      toOptions({ extrusion: 'population', extrusionColors: '#fff,#f00' })
        .extrusion,
    ).toEqual({
      height: { property: 'population' },
      color: { property: 'population', colors: ['#fff', '#f00'] },
    });
  });

  it('data-extrusion-colors は値と色の組を対応表として読む', () => {
    expect(
      toOptions({
        extrusion: 'height',
        extrusionColor: 'kind',
        extrusionColors: 'house:#3b82f6, shop:#ef4444',
      }).extrusion,
    ).toEqual({
      height: { property: 'height' },
      color: {
        property: 'kind',
        colors: { house: '#3b82f6', shop: '#ef4444' },
      },
    });
  });

  it('読めない数値と範囲は渡さない (0 は数値として渡す)', () => {
    expect(
      toOptions({
        extrusion: 'population',
        extrusionMaxHeight: 'high',
        extrusionHeightScale: '0',
        extrusionHeightRange: '100,0',
        extrusionColorRange: '1',
      }).extrusion,
    ).toEqual({
      height: { property: 'population', heightScale: 0 },
      color: { property: 'population' },
    });
  });

  it('読めない値しか無ければ、プロパティ名だけを渡す', () => {
    expect(
      toOptions({
        extrusion: 'population',
        extrusionMaxHeight: '',
        extrusionHeightRange: 'a,b',
      }).extrusion,
    ).toBe('population');
  });

  it('data-mask だけなら URL だけを渡す', () => {
    expect(toOptions({ mask: ' https://example.com/area.geojson ' }).mask).toBe(
      'https://example.com/area.geojson',
    );
  });

  it('data-mask-* をすべて読む', () => {
    expect(
      toOptions({
        mask: '/area.geojson',
        maskColor: '#123456',
        maskOpacity: '0.5',
        maskOutline: 'on',
      }).mask,
    ).toEqual({
      geojson: '/area.geojson',
      color: '#123456',
      opacity: 0.5,
      outline: true,
    });
  });

  it('data-mask-outline は on のときだけ線を引く (大文字小文字と空白を区別しない)', () => {
    expect(toOptions({ mask: '/a.geojson', maskOutline: ' ON ' }).mask).toEqual(
      {
        geojson: '/a.geojson',
        outline: true,
      },
    );
    expect(toOptions({ mask: '/a.geojson', maskOutline: 'off' }).mask).toBe(
      '/a.geojson',
    );
    expect(toOptions({ mask: '/a.geojson', maskOutline: '' }).mask).toBe(
      '/a.geojson',
    );
  });

  it('読めない data-mask-opacity と空の data-mask-color は渡さない (0 は渡す)', () => {
    expect(
      toOptions({ mask: '/a.geojson', maskOpacity: 'half', maskColor: ' ' })
        .mask,
    ).toBe('/a.geojson');
    expect(toOptions({ mask: '/a.geojson', maskOpacity: '0' }).mask).toEqual({
      geojson: '/a.geojson',
      opacity: 0,
    });
  });

  it('範囲の外の data-mask-opacity は検査せずに渡す (maps-core がエラーを出して既定値にする)', () => {
    expect(toOptions({ mask: '/a.geojson', maskOpacity: '2' }).mask).toEqual({
      geojson: '/a.geojson',
      opacity: 2,
    });
  });

  it('data-mask が無いか空なら、ほかの data-mask-* は無視する', () => {
    const others = { maskColor: '#000', maskOpacity: '0.5', maskOutline: 'on' };
    expect('mask' in toOptions(others)).toBe(false);
    expect('mask' in toOptions({ ...others, mask: '  ' })).toBe(false);
  });
});
