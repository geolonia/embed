'use strict'

import assert from 'assert'
import { JSDOM } from 'jsdom'
import * as util from './util'

const base = 'https://base.example.com/parent/'

before(() => {
  global.location = { href: base }
})

describe('Tests for util.js', () => {
  it('URL should be detected', () => {
    assert.deepEqual(true, !!util.isURL('http://example.com'))
  })

  it('URL with SSL should be detected', () => {
    assert.deepEqual(true, !!util.isURL('https://example.com'))
  })

  it('Path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/parent/example-path',
      util.isURL('./example-path'),
    )
  })

  it('Parent path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      util.isURL('../example-path'),
    )
  })

  it('Absolute path should be detected', () => {
    assert.deepEqual(
      'https://base.example.com/example-path',
      util.isURL('/example-path'),
    )
  })

  it('Name should not be detected', () => {
    assert.deepEqual(false, util.isURL('example.com/hello'))
  })

  it('should detect the object is DOM correctly', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <div class="test-class"></div>
    </body></html>`).window

    assert.deepEqual(true, util.isDomElement(mocDocument.querySelector('.test-class')))
    assert.deepEqual(false, util.isDomElement('hello world'))
    assert.deepEqual(false, util.isDomElement({ hello: 'world' }))
  })

  it('should be able to get dom', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`)

    global.window = dom.window
    global.document = dom.window.document

    const el = document.querySelector('#test-element')
    assert.deepEqual(el, util.getContainer(el))
    const params = { container: el }
    assert.deepEqual(el, util.getContainer(params))

    assert.deepEqual(el, util.getContainer('#test-element'))
    assert.deepEqual(el, util.getContainer({ container: '#test-element' }))

    assert.deepEqual(false, util.getContainer('#fail-element'))
    assert.deepEqual(false, util.getContainer({ container: '#fail-element' }))
  })

  it('should merge legacyoptions into options as expected.', () => {
    const dom = new JSDOM(`<html><body>
      <div id="test-element"></div>
    </body></html>`)

    global.window = dom.window
    global.document = dom.window.document

    const options1 = util.handleMarkerOptions(document.getElementById('test-element'), { foo: 'bar' })
    assert.deepEqual(document.getElementById('test-element'), options1.element)
    assert.deepEqual('bar', options1.foo)

    const options2 = util.handleMarkerOptions(false, { foo: 'bar' })
    assert.deepEqual('bar', options2.foo)

    const options3 = util.handleMarkerOptions({ hello: 'world' }, { foo: 'bar' })
    assert.deepEqual('world', options3.hello)
  })

  describe('language detection', () => {
    it('should work with Chrome', () => {
      global.window = {
        navigator: {
          language: 'ja',
          languages: ['ja', 'en', 'en-US', 'ar'],
        },
      }
      assert.equal(util.getLang(), 'ja')
    })

    it('should work with iOS safari', () => {
      global.window = {
        navigator: {
          language: 'ja-JP',
          languages: ['ja-JP'],
        },
      }
      assert.equal(util.getLang(), 'ja')
    })
  })

  it('should get correct style url', () => {
    const atts = {
      apiUrl: 'https://example.com',
      key: '1234',
    }

    assert.deepEqual('https://cdn.geolonia.com/style/hello/world/en.json', util.getStyle('hello/world', atts))
    assert.deepEqual('https://example.com/style.json', util.getStyle('https://example.com/style.json', atts))
    assert.deepEqual('https://base.example.com/parent/style.json', util.getStyle('./style.json', atts))
    assert.deepEqual('https://base.example.com/style.json', util.getStyle('/style.json', atts))
  })

  it('should handle mapboxgl options `minZoom` and `maxZoom` well', () => {
    {
      const atts = { minZoom: '', maxZoom: '10' }
      const options = util.getOptions({}, {}, atts)
      assert.deepEqual('undefined', typeof options.minZoom)
      assert.deepEqual(10, options.maxZoom)
    }

    {
      const atts = { minZoom: '0', maxZoom: '' }
      const options = util.getOptions({}, {}, atts)
      assert.deepEqual(0, options.minZoom)
      assert.deepEqual('undefined', typeof options.maxZoom)
    }

    {
      const atts = { minZoom: '0', maxZoom: '' }
      const params = { minZoom: 7 }
      const options = util.getOptions({}, params, atts)
      assert.deepEqual(7, options.minZoom)
      assert.deepEqual('undefined', typeof options.maxZoom)
    }
  })

  it('should handle control position options.', () => {
    const att = 'top-left'
    const { enabled, position } = util.parseControlOption(att)
    assert.strictEqual(true, enabled)
    assert.strictEqual('top-left', position)
  })

  it('should handle control position on.', () => {
    const att = 'on'
    const { enabled, position } = util.parseControlOption(att)
    assert.strictEqual(true, enabled)
    assert.strictEqual(void 0, position)
  })

  it('should handle control position off.', () => {
    const att = 'off'
    const { enabled, position } = util.parseControlOption(att)
    assert.strictEqual(false, enabled)
    assert.strictEqual(void 0, position)
  })

  it('should parse simple vector value with http.', () => {
    const attributeValue = 'https://example.com/path/to/tile.json'
    assert.strictEqual(
      attributeValue,
      util.parseSimpleVector(attributeValue),
    )
  })

  it('should parse simple vector value with geolonia schema.', () => {
    const attributeValue = 'geolonia://tiles/username/ct_123'
    assert.strictEqual(
      'https://tileserver.geolonia.com/customtiles/ct_123/tiles.json',
      util.parseSimpleVector(attributeValue),
    )
  })

  it('should parse simple vector value with customtile ID', () => {
    const attributeValue = 'ct_123'
    assert.strictEqual(
      'https://tileserver.geolonia.com/customtiles/ct_123/tiles.json',
      util.parseSimpleVector(attributeValue),
    )
  })
  it('should parse simple vector value with stage identifier', () => {
    const attributeValue = 'ct_123'
    assert.strictEqual(
      'https://tileserver.geolonia.com/customtiles/ct_123/tiles.json',
      util.parseSimpleVector(attributeValue),
    )
  })
})
