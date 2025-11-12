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
    const {document: mocDocument} = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('v1', keyring.stage);

    delete process.env.MAP_PLATFORM_STAGE;
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

    delete process.env.MAP_PLATFORM_STAGE;
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
