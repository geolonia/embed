'use strict';

import assert from 'assert';
import { JSDOM } from 'jsdom';
import { getContainer, getLang, getOptions, getStyle, handleMarkerOptions, isDomElement, isURL, parseControlOption, parseSimpleVector, sanitizeDescription } from './util';

const base = 'https://base.example.com/parent/';

before(() => {
  global.location = {
    ...global.location,
    href: base,
  };
});

describe('Tests for util.js', () => {
  it('URL should be detected', () => {
    assert.deepEqual(true, !!isURL('http://example.com'));
  });

  it('URL with SSL should be detected', () => {
    assert.deepEqual(true, !!isURL('https://example.com'));
  });

  it('Path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/parent/example-path',
      isURL('./example-path'),
    );
  });

  it('Parent path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      isURL('../example-path'),
    );
  });

  it('Absolute path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      isURL('/example-path'),
    );
  });

  it('Name should not be detected', () => {
    assert.deepEqual(false, isURL('example.com/hello'));
  });

  it('should detect the object is DOM correctly', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <div class="test-class"></div>
    </body></html>`).window;

    assert.deepEqual(true, isDomElement(mocDocument.querySelector('.test-class')));
    assert.deepEqual(false, isDomElement('hello world'));
    assert.deepEqual(false, isDomElement({ hello: 'world' }));
  });

  it('should be able to get dom', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`);

    global.window = dom.window;
    global.document = dom.window.document;

    const el = document.querySelector('#test-element') as HTMLElement;
    assert.deepEqual(el, getContainer(el));
    const params = { container: el };
    assert.deepEqual(el, getContainer(params));

    // specify as a selector
    assert.deepEqual(el, getContainer('#test-element'));
    assert.deepEqual(el, getContainer({ container: '#test-element' }));

    // specify as an id attribute value
    assert.deepEqual(el, getContainer('test-element'));
    assert.deepEqual(el, getContainer({ container: 'test-element' }));

    // negative cases
    assert.deepEqual(false, getContainer('#fail-element'));
    assert.deepEqual(false, getContainer({ container: '#fail-element' }));
    assert.deepEqual(false, getContainer('fail-element'));
    assert.deepEqual(false, getContainer({ container: 'fail-element' }));  });

  it('should merge legacyoptions into options as expected.', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`);

    global.window = dom.window;
    global.document = dom.window.document;

    const options1 = handleMarkerOptions(document.getElementById('test-element'), { color: '#FF1122' });
    assert.deepEqual(document.getElementById('test-element'), options1.element);
    assert.deepEqual(options1.color, '#FF1122');

    const options2 = handleMarkerOptions(false, { color: '#FF1122' });
    assert.deepEqual(options2.color, '#FF1122');

    const options3 = handleMarkerOptions({ scale: 2 }, { color: '#FF1122' });
    assert.deepEqual(options3.scale, 2);
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
      assert.equal(getLang(), 'ja');
    });

    it('should work with iOS safari', () => {
      global.window = {
        // @ts-ignore forcefully assigning values to readonly properties
        navigator: {
          language: 'ja-JP',
          languages: ['ja-JP'],
        },
      };
      assert.equal(getLang(), 'ja');
    });
  });

  it('should get correct style url', () => {
    const atts = {
      apiUrl: 'https://example.com',
      key: '1234',
    };

    assert.deepEqual('https://cdn.geolonia.com/style/hello/world/en.json', getStyle('hello/world', atts));
    assert.deepEqual('https://example.com/style.json', getStyle('https://example.com/style.json', atts));
    assert.deepEqual('https://base.example.com/parent/style.json', getStyle('./style.json', atts));
    assert.deepEqual('https://base.example.com/style.json', getStyle('/style.json', atts));
  });

  it('should handle maplibregl options `minZoom` and `maxZoom` well', () => {
    {
      const atts = { minZoom: '', maxZoom: '10' };
      const options = getOptions({}, {}, atts);
      assert.deepEqual('undefined', typeof options.minZoom);
      assert.deepEqual(10, options.maxZoom);
    }

    {
      const atts = { minZoom: '0', maxZoom: '' };
      const options = getOptions({}, {}, atts);
      assert.deepEqual(0, options.minZoom);
      assert.deepEqual('undefined', typeof options.maxZoom);
    }

    {
      const atts = { minZoom: '0', maxZoom: '' };
      const params = { minZoom: 7 };
      const options = getOptions({}, params, atts);
      assert.deepEqual(7, options.minZoom);
      assert.deepEqual('undefined', typeof options.maxZoom);
    }
  });

  it('should handle control position options.', () => {
    const att = 'top-left';
    const { enabled, position } = parseControlOption(att);
    assert.strictEqual(true, enabled);
    assert.strictEqual('top-left', position);
  });

  it('should handle control position on.', () => {
    const att = 'on';
    const { enabled, position } = parseControlOption(att);
    assert.strictEqual(true, enabled);
    assert.strictEqual(void 0, position);
  });

  it('should handle control position off.', () => {
    const att = 'off';
    const { enabled, position } = parseControlOption(att);
    assert.strictEqual(false, enabled);
    assert.strictEqual(void 0, position);
  });

  it('should parse simple vector value with http.', () => {
    const attributeValue = 'https://example.com/path/to/tile.json';
    assert.strictEqual(
      attributeValue,
      parseSimpleVector(attributeValue),
    );
  });

  it('should parse simple vector value with geolonia schema.', () => {
    const attributeValue = 'geolonia://tiles/username/ct_123';
    assert.strictEqual(
      attributeValue,
      parseSimpleVector(attributeValue),
    );
  });

  it('should parse simple vector value with customtile ID', () => {
    const attributeValue = 'ct_123';
    assert.strictEqual(
      'geolonia://tiles/custom/ct_123',
      parseSimpleVector(attributeValue),
    );
  });

  describe('Tests for sanitizeDescription', async () => {
    it('should sanitize description', async () => {
      const description = '<script>alert("hello");</script>ここが集合場所です。13時までに集合してください。';
      assert.strictEqual(
        'ここが集合場所です。13時までに集合してください。',
        await sanitizeDescription(description),
      );
    });

    it('should not sanitize img tag, but should sanitize attributes other than "src", "srcset", "alt", "title", "width", "height", "loading"', async () => {
      // Ref. https://www.npmjs.com/package/sanitize-html
      const description = '<img decoding="auto" src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。';
      assert.strictEqual(
        '<img src="hibiya-park.jpeg" /><br />ここが集合場所です。13時までに集合してください。',
        await sanitizeDescription(description),
      );
    });

    it('should not sanitize "class" attribute', async () => {
      const description = '<span class="red">ここが集合場所です。13時までに集合してください。</span>';
      assert.strictEqual(
        '<span class="red">ここが集合場所です。13時までに集合してください。</span>',
        await sanitizeDescription(description),
      );
    });
  });
});
