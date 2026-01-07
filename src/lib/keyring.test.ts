import { keyring } from './keyring';
import { JSDOM } from 'jsdom';
import assert from 'assert';

describe('parse api key from dom', () => {
  beforeEach(() => {
    keyring.reset();
    process.env.MAP_PLATFORM_STAGE = 'dev';
  });
  afterEach(() => {
    delete process.env.MAP_PLATFORM_STAGE;
  });
  after(() => {
    keyring.reset();
  });

  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?geolonia-api-key=abc"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('abc', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script src="https://external.example.com/?geolonia-api-key=def"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('def', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "dev"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/dev/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "v1"', () => {
    process.env.MAP_PLATFORM_STAGE = 'v1';
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('v1', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "v123.4"', () => {
    process.env.MAP_PLATFORM_STAGE = 'v123.4';
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v123.4/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('v123.4', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "dev" if process.env.MAP_PLATFORM_STAGE is not set', () => {
    delete process.env.MAP_PLATFORM_STAGE;
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script src="https://external.example.com/?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });
});

describe('isGeoloniaStyleCheck', () => {
  const originalHref = 'https://base.example.com/parent/';

  before(() => {
    global.location = {
      ...global.location,
      href: originalHref,
    };
  });

  afterEach(() => {
    // Reset location after each test
    global.location = {
      ...global.location,
      href: originalHref,
    };
  });

  it('should return true for empty or null style (default)', () => {
    assert.strictEqual(keyring.isGeoloniaStyleCheck(''), true);
    assert.strictEqual(keyring.isGeoloniaStyleCheck(null), true);
    assert.strictEqual(keyring.isGeoloniaStyleCheck(undefined), true);
  });

  it('should return true for Geolonia logical names', () => {
    assert.strictEqual(keyring.isGeoloniaStyleCheck('geolonia/basic'), true);
    assert.strictEqual(keyring.isGeoloniaStyleCheck('geolonia/basic-v2'), true);
    assert.strictEqual(keyring.isGeoloniaStyleCheck('geolonia/gsi'), true);
  });

  it('should return true for Geolonia CDN URLs', () => {
    assert.strictEqual(keyring.isGeoloniaStyleCheck('https://cdn.geolonia.com/style/geolonia/basic/ja.json'), true);
    assert.strictEqual(keyring.isGeoloniaStyleCheck('https://api.geolonia.com/v1/styles/basic.json'), true);
  });

  it('should return false for external HTTPS URLs', () => {
    assert.strictEqual(keyring.isGeoloniaStyleCheck('https://tile.openstreetmap.jp/styles/osm-bright/style.json'), false);
    assert.strictEqual(keyring.isGeoloniaStyleCheck('https://example.com/style.json'), false);
  });

  it('should return false for relative paths to external .json files', () => {
    assert.strictEqual(keyring.isGeoloniaStyleCheck('./my-style.json'), false);
    assert.strictEqual(keyring.isGeoloniaStyleCheck('/styles/custom.json'), false);
  });

  it('should return true for relative paths to geolonia.com', () => {
    // Simulate being on geolonia.com
    global.location = {
      ...global.location,
      href: 'https://cdn.geolonia.com/demo.html',
    };
    assert.strictEqual(keyring.isGeoloniaStyleCheck('./style.json'), true);
  });
});