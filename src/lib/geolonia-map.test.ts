'use strict';

import assert from 'assert';
import {
  transformGeoloniaApiSource,
  transformGeoloniaTileSource,
  transformGeoloniaSprite,
} from './transform-request';

describe('transformGeoloniaApiSource', () => {
  const sourcesUrl = new URL('https://api.geolonia.com/sources?key=test-key&sessionId=abc123');

  it('should redirect api.geolonia.com URLs to sourcesUrl', () => {
    const result = transformGeoloniaApiSource(
      'https://api.geolonia.com/some/path',
      sourcesUrl,
    );
    assert.deepStrictEqual(result, { url: sourcesUrl.toString() });
  });

  it('should return null for non-Geolonia URLs', () => {
    const result = transformGeoloniaApiSource(
      'https://example.com/tiles',
      sourcesUrl,
    );
    assert.strictEqual(result, null);
  });
});

describe('transformGeoloniaTileSource', () => {
  const atts = { key: 'test-key', stage: 'v1' };
  const sessionId = 'session123';

  it('should transform geolonia:// tile URLs and inject key/sessionId', () => {
    const result = transformGeoloniaTileSource(
      'geolonia://tiles/myuser/my-tileset',
      atts,
      sessionId,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.hostname, 'tileserver.geolonia.com');
    assert.strictEqual(url.pathname, '/customtiles/my-tileset/tiles.json');
    assert.strictEqual(url.searchParams.get('key'), 'test-key');
    assert.strictEqual(url.searchParams.get('sessionId'), 'session123');
  });

  it('should inject key/sessionId into Geolonia tiles host URLs', () => {
    const result = transformGeoloniaTileSource(
      'https://tileserver.geolonia.com/some/path',
      atts,
      sessionId,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.searchParams.get('key'), 'test-key');
    assert.strictEqual(url.searchParams.get('sessionId'), 'session123');
  });

  it('should switch to dev hostname when stage is dev', () => {
    const devAtts = { key: 'test-key', stage: 'dev' };
    const result = transformGeoloniaTileSource(
      'https://tileserver.geolonia.com/some/path',
      devAtts,
      sessionId,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.hostname, 'tileserver-dev.geolonia.com');
  });

  it('should return null for non-Geolonia URLs', () => {
    const result = transformGeoloniaTileSource(
      'https://example.com/tiles',
      atts,
      sessionId,
    );
    assert.strictEqual(result, null);
  });

  it('should handle *.tiles.geolonia.com hosts', () => {
    const result = transformGeoloniaTileSource(
      'https://foo.tiles.geolonia.com/path',
      atts,
      sessionId,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.searchParams.get('key'), 'test-key');
  });
});

describe('transformGeoloniaSprite', () => {
  const atts = { key: 'test-key', stage: 'v1' };

  it('should inject key and correct stage into Geolonia sprite URLs', () => {
    const result = transformGeoloniaSprite(
      'https://api.geolonia.com/dev/sprites/basic-v2/sprite',
      atts,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.pathname, '/v1/sprites/basic-v2/sprite');
    assert.strictEqual(url.searchParams.get('key'), 'test-key');
  });

  it('should handle v1 stage in URL', () => {
    const result = transformGeoloniaSprite(
      'https://api.geolonia.com/v1/sprites/basic-v2/sprite',
      atts,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.pathname, '/v1/sprites/basic-v2/sprite');
    assert.strictEqual(url.searchParams.get('key'), 'test-key');
  });

  it('should return null for non-Geolonia sprite URLs', () => {
    const result = transformGeoloniaSprite(
      'https://example.com/sprites/basic/sprite.json',
      atts,
    );
    assert.strictEqual(result, null);
  });

  it('should switch stage from v1 to dev when atts.stage is dev', () => {
    const devAtts = { key: 'test-key', stage: 'dev' };
    const result = transformGeoloniaSprite(
      'https://api.geolonia.com/v1/sprites/basic-v2/sprite',
      devAtts,
    );
    assert.ok(result);
    const url = new URL(result.url);
    assert.strictEqual(url.pathname, '/dev/sprites/basic-v2/sprite');
  });
});
