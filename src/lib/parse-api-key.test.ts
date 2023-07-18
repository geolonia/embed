import { keyring } from './parse-api-key';
import { JSDOM } from 'jsdom';
import assert from 'assert';

describe('parse api key from dom', () => {
  beforeEach(() => {
    delete window.geolonia;
  });

  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?geolonia-api-key=abc"></script>
    </body></html>`).window;

    window.geolonia = {};

    keyring.parse(mocDocument);
    assert.deepEqual('abc', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should override API key and stage with pre-initialized window.geolonia', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?geolonia-api-key=abc"></script>
    </body></html>`).window;

    window.geolonia = {
      _stage: 'testStage',
      _apiKey: 'testApiKey',
    };

    keyring.parse(mocDocument);
    assert.deepEqual('testApiKey', keyring.apiKey);
    assert.deepEqual('testStage', keyring.stage);
  });

  it('should override only stage with pre-initialized window.geolonia', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?geolonia-api-key=abc"></script>
    </body></html>`).window;

    window.geolonia = {
      _stage: 'testStage',
    };

    keyring.parse(mocDocument);
    assert.deepEqual('abc', keyring.apiKey);
    assert.deepEqual('testStage', keyring.stage);
  });

  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script src="https://external.example.com/?geolonia-api-key=def"></script>
    </body></html>`).window;

    window.geolonia = {};

    keyring.parse(mocDocument);
    assert.deepEqual('def', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "dev"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/dev/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    window.geolonia = {};

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('dev', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "v1"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    window.geolonia = {};

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('v1', keyring.stage);
  });

  it('should be "YOUR-API-KEY" and "v123.4"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v123.4/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window;

    window.geolonia = {};

    keyring.parse(mocDocument);
    assert.deepEqual('YOUR-API-KEY', keyring.apiKey);
    assert.deepEqual('v123.4', keyring.stage);
  });
});
