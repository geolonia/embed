import { describe, it, expect, beforeAll } from 'vitest';

import { JSDOM } from 'jsdom';
import {
  getContainer,
  getLang,
  getOptions,
  getStyle,
  handleMarkerOptions,
  isDomElement,
  isURL,
  isGeoloniaTilesHost,
  parseControlOption,
  parseSimpleVector,
  sanitizeDescription,
  loadImageCompatibility,
  handleErrorMode,
} from './util';

const base = 'https://base.example.com/parent/';

beforeAll(() => {
  global.location = {
    ...global.location,
    href: base,
  };
});

describe('Tests for util.js', () => {
  it('URL should be detected', () => {
    expect(true).toEqual(!!isURL('http://example.com'));
  });

  it('URL with SSL should be detected', () => {
    expect(true).toEqual(!!isURL('https://example.com'));
  });

  it('Path should be detected', () => {
    expect('https://base.example.com/parent/example-path').toEqual(isURL('./example-path'),
    );
  });

  it('Parent path should be detected', () => {
    expect('https://base.example.com/example-path').toEqual(isURL('../example-path'),
    );
  });

  it('Absolute path should be detected', () => {
    expect('https://base.example.com/example-path').toEqual(isURL('/example-path'),
    );
  });

  it('Name should not be detected', () => {
    expect(false).toEqual(isURL('example.com/hello'));
  });

  describe('isGeoloniaTilesHost', () => {
    it('detects primary tileserver hostname', () => {
      const url =
        'https://tileserver.geolonia.com/v3/tiles.json?key=YOUR-API-KEY';
      expect(isGeoloniaTilesHost(url)).toBe(true);
    });

    it('detects tiles.geolonia.com subdomains', () => {
      const url = new URL('https://osm.v2.tiles.geolonia.com/tiles.json');
      expect(isGeoloniaTilesHost(url)).toBe(true);
    });

    it('detects tiles.geolonia.com subdomains', () => {
      const url = new URL('https://osm.v3.tiles.geolonia.com/tiles.json');
      expect(isGeoloniaTilesHost(url)).toBe(true);
    });

    it('returns false for other hosts or invalid urls', () => {
      expect(isGeoloniaTilesHost('https://example.com/tiles')).toBe(false);
      expect(isGeoloniaTilesHost('not-a-url')).toBe(false);
    });
  });

  it('should detect the object is DOM correctly', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <div class="test-class"></div>
    </body></html>`).window;

    expect(true).toEqual(isDomElement(mocDocument.querySelector('.test-class')),
    );
    expect(false).toEqual(isDomElement('hello world'));
    expect(false).toEqual(isDomElement({ hello: 'world' }));
  });

  it('should be able to get dom', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`);

    // @ts-ignore
    global.window = dom.window;
    global.document = dom.window.document;

    const el = document.querySelector('#test-element') as HTMLElement;
    expect(el).toEqual(getContainer(el));
    const params = { container: el };
    expect(el).toEqual(getContainer(params));

    // specify as a selector
    expect(el).toEqual(getContainer('#test-element'));
    expect(el).toEqual(getContainer({ container: '#test-element' }));

    // specify as an id attribute value
    expect(el).toEqual(getContainer('test-element'));
    expect(el).toEqual(getContainer({ container: 'test-element' }));

    // negative cases
    expect(false).toEqual(getContainer('#fail-element'));
    expect(false).toEqual(getContainer({ container: '#fail-element' }));
    expect(false).toEqual(getContainer('fail-element'));
    expect(false).toEqual(getContainer({ container: 'fail-element' }));
  });

  it('should merge legacy options into options as expected.', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`);

    // @ts-ignore
    global.window = dom.window;
    global.document = dom.window.document;

    const options1 = handleMarkerOptions(
      document.getElementById('test-element'),
      { color: '#FF1122' },
    );
    expect(document.getElementById('test-element')).toEqual(options1.element);
    expect(options1.color).toEqual('#FF1122');

    const options2 = handleMarkerOptions(false, { color: '#FF1122' });
    expect(options2.color).toEqual('#FF1122');

    const options3 = handleMarkerOptions({ scale: 2 }, { color: '#FF1122' });
    expect(options3.scale).toEqual(2);
  });

  describe('language detection', () => {
    it('should work with Chrome', () => {
      global.window = {
        // @ts-ignore forcefully assigning values to readonly properties
        navigator: {
          language: 'ja',
          languages: ['ja', 'en', 'en-US', 'ar'],
        },
      };
      expect(getLang()).toEqual('ja');
    });

    it('should work with iOS safari', () => {
      global.window = {
        // @ts-ignore forcefully assigning values to readonly properties
        navigator: {
          language: 'ja-JP',
          languages: ['ja-JP'],
        },
      };
      expect(getLang()).toEqual('ja');
    });
  });

  it('should get correct style url', () => {
    const atts = {
      apiUrl: 'https://example.com',
      key: '1234',
      lang: 'en',
    };

    // 従来モード: 論理名（API キー必須）
    expect('https://cdn.geolonia.com/style/hello/world/en.json').toEqual(getStyle('hello/world', atts),
    );

    // URL モード: https://（外部 URL、API キー不要）
    expect('https://example.com/style.json').toEqual(getStyle('https://example.com/style.json', atts),
    );

    // URL モード: 相対パス ./（外部 URL、API キー不要）
    expect('https://base.example.com/parent/style.json').toEqual(getStyle('./style.json', atts),
    );

    // URL モード: 絶対パス /（外部 URL、API キー不要）
    expect('https://base.example.com/style.json').toEqual(getStyle('/style.json', atts),
    );

    // URL モード: .json で終わる（外部 URL として解決）
    expect('https://base.example.com/parent/custom.json').toEqual(getStyle('custom.json', atts),
    );

    // デフォルト: 空文字列（API キー必須）
    expect('https://cdn.geolonia.com/style/geolonia/basic-v2/en.json').toEqual(getStyle('', atts),
    );

    // デフォルト: null/undefined（API キー必須）
    expect('https://cdn.geolonia.com/style/geolonia/basic-v2/en.json').toEqual(getStyle(null, atts),
    );

    // 日本語環境でのデフォルト
    const attsJa = { ...atts, lang: 'ja' };
    expect('https://cdn.geolonia.com/style/geolonia/basic-v2/ja.json').toEqual(getStyle('', attsJa),
    );

    // 日本語環境での論理名
    expect('https://cdn.geolonia.com/style/geolonia/basic/ja.json').toEqual(getStyle('geolonia/basic', attsJa),
    );
  });

  it('should throw error when using Geolonia styles without API key', () => {
    const attsNoKey = {
      apiUrl: 'https://example.com',
      key: '',
      lang: 'en',
    };

    // 論理名: API キー無しでエラー
    expect(
      () => getStyle('geolonia/basic', attsNoKey),
    ).toThrow(/API key is required/);

    // デフォルト: API キー無しでエラー
    expect(
      () => getStyle('', attsNoKey),
    ).toThrow(/API key is required/);

    // Geolonia CDN の URL: API キー無しでエラー
    expect(
      () => getStyle('https://cdn.geolonia.com/style/geolonia/basic/en.json', attsNoKey),
    ).toThrow(/API key is required/);

    // 外部 URL: API キー無しでも OK
    expect(() => {
      getStyle('https://tile.openstreetmap.jp/styles/osm-bright/style.json', attsNoKey);
    }).not.toThrow();

    expect(() => {
      getStyle('./my-style.json', attsNoKey);
    }).not.toThrow();
  });

  it('should handle maplibregl options `minZoom` and `maxZoom` well', () => {
    {
      const atts = { minZoom: '', maxZoom: '10' };
      const options = getOptions({}, {}, atts);
      expect('undefined').toEqual(typeof options.minZoom);
      expect(10).toEqual(options.maxZoom);
    }

    {
      const atts = { minZoom: '0', maxZoom: '' };
      const options = getOptions({}, {}, atts);
      expect(0).toEqual(options.minZoom);
      expect('undefined').toEqual(typeof options.maxZoom);
    }

    {
      const atts = { minZoom: '0', maxZoom: '' };
      const params = { minZoom: 7 };
      const options = getOptions({}, params, atts);
      expect(7).toEqual(options.minZoom);
      expect('undefined').toEqual(typeof options.maxZoom);
    }
  });

  it('should handle control position options.', () => {
    const att = 'top-left';
    const { enabled, position } = parseControlOption(att);
    expect(true).toBe(enabled);
    expect('top-left').toBe(position);
  });

  it('should handle control position on.', () => {
    const att = 'on';
    const { enabled, position } = parseControlOption(att);
    expect(true).toBe(enabled);
    expect(void 0).toBe(position);
  });

  it('should handle control position off.', () => {
    const att = 'off';
    const { enabled, position } = parseControlOption(att);
    expect(false).toBe(enabled);
    expect(void 0).toBe(position);
  });

  it('should parse simple vector value with http.', () => {
    const attributeValue = 'https://example.com/path/to/tile.json';
    expect(attributeValue).toBe(parseSimpleVector(attributeValue));
  });

  it('should parse simple vector value with geolonia schema.', () => {
    const attributeValue = 'geolonia://tiles/username/ct_123';
    expect(attributeValue).toBe(parseSimpleVector(attributeValue));
  });

  it('should parse simple vector value with custom tile ID', () => {
    const attributeValue = 'ct_123';
    expect('geolonia://tiles/custom/ct_123').toBe(parseSimpleVector(attributeValue),
    );
  });

  describe('Tests for sanitizeDescription', async () => {
    it('should sanitize description', async () => {
      const description =
        '<script>alert("hello");</script>ここが集合場所です。13時までに集合してください。';
      expect('ここが集合場所です。13時までに集合してください。').toBe(await sanitizeDescription(description),
      );
    });

    it('should not sanitize img tag, but should sanitize attributes other than "src", "srcset", "alt", "title", "width", "height", "loading"', async () => {
      // Ref. https://www.npmjs.com/package/sanitize-html
      const description =
        '<img decoding="auto" src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。';
      expect('<img src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。').toBe(await sanitizeDescription(description),
      );
    });

    it('should not sanitize "class" attribute', async () => {
      const description =
        '<span class="red">ここが集合場所です。13時までに集合してください。</span>';
      expect('<span class="red">ここが集合場所です。13時までに集合してください。</span>').toBe(await sanitizeDescription(description),
      );
    });
  });
});

describe('loadImageCompatibility', () => {
  it('should call the callback with response data when the promise resolves', async () => {
    const mockResponse = {
      data: new Image(),
      cacheControl: 'public, max-age=3600',
      expires: '1609459200',
    };
    const promise = Promise.resolve(mockResponse);

    await new Promise<void>((resolve) => {
      loadImageCompatibility(promise, (error, data, expiry) => {
        expect(error).toEqual(null);
        expect(data).toEqual(mockResponse.data);
        expect(expiry).toEqual({
          cacheControl: mockResponse.cacheControl,
          expires: mockResponse.expires,
        });
        resolve();
      });
    });
  });

  it('should call the callback with error when the promise rejects', async () => {
    const mockError = new Error('Failed to load image');
    const promise = Promise.reject(mockError);

    await new Promise<void>((resolve) => {
      loadImageCompatibility(promise, (error, data, expiry) => {
        expect(error).toEqual(mockError);
        expect(data).toBe(undefined);
        expect(expiry).toBe(undefined);
        resolve();
      });
    });
  });
});

describe('handleErrorMode', () => {
  const createContainer = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  };

  it('既定では行動につながる文言（見出し・手順・問い合わせ案内）を描画する', () => {
    const container = createContainer();
    handleErrorMode(container);

    const errorContainer = container.querySelector(
      '.geolonia__error-container',
    );
    expect(errorContainer).not.toBeNull();
    expect(
      errorContainer.querySelector('.geolonia__error-message-title')
        .textContent,
    ).toBe('地図を表示できませんでした');
    // 手順は 4 つ（ブラウザ再起動 → 端末再起動 → 別ブラウザ → ドライバ更新）
    expect(
      errorContainer.querySelectorAll('.geolonia__error-message-steps li')
        .length,
    ).toBe(4);
    expect(
      errorContainer.querySelector('.geolonia__error-message-contact'),
    ).not.toBeNull();
  });

  it('既定では狭いコンテナ向けの短縮文も同時に描画する（表示切替は CSS が担う）', () => {
    const container = createContainer();
    handleErrorMode(container);

    expect(
      container.querySelector('.geolonia__error-message-brief'),
    ).not.toBeNull();
  });

  it('開発者向けの案内文（開発者ツール）を含まない', () => {
    const container = createContainer();
    handleErrorMode(container);

    expect(container.textContent).not.toContain('開発者ツール');
  });

  it('data-error-message で文言を差し替えられる', () => {
    const container = createContainer();
    handleErrorMode(container, { message: '地図の表示に失敗しました。0120-000-000 までご連絡ください。' });

    const description = container.querySelector(
      '.geolonia__error-message-description',
    );
    expect(description.textContent).toBe(
      '地図の表示に失敗しました。0120-000-000 までご連絡ください。',
    );
    // 既定の手順リストは描画しない
    expect(
      container.querySelector('.geolonia__error-message-steps'),
    ).toBeNull();
  });

  it('差し替え文言の HTML はエスケープする', () => {
    const container = createContainer();
    handleErrorMode(container, {
      message: '<img src=x onerror="alert(1)">お問い合わせください',
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(
      '<img src=x onerror="alert(1)">お問い合わせください',
    );
  });

  it('off を指定すると何も描画しない', () => {
    const container = createContainer();
    handleErrorMode(container, { message: 'off' });

    expect(container.querySelector('.geolonia__error-container')).toBeNull();
    expect(container.children.length).toBe(0);
  });
});
