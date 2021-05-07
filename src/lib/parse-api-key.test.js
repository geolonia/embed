import parseApiKey from './parse-api-key'
import { JSDOM } from 'jsdom'
import assert from 'assert'

describe('parse api key from dom', () => {
  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?geolonia-api-key=abc"></script>
    </body></html>`).window

    const params = parseApiKey(mocDocument)
    assert.deepEqual('abc', params.key)
    assert.deepEqual('dev', params.stage)
  })

  it('should parse with geolonia flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script src="https://external.example.com/?geolonia-api-key=def"></script>
    </body></html>`).window

    const params = parseApiKey(mocDocument)
    assert.deepEqual('def', params.key)
    assert.deepEqual('dev', params.stage)
  })

  it('should be "YOUR-API-KEY" and "dev"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/dev/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window

    const params = parseApiKey(mocDocument)
    assert.deepEqual('YOUR-API-KEY', params.key)
    assert.deepEqual('dev', params.stage)
  })

  it('should be "YOUR-API-KEY" and "v1"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window

    const params = parseApiKey(mocDocument)
    assert.deepEqual('YOUR-API-KEY', params.key)
    assert.deepEqual('v1', params.stage)
  })

  it('should be "YOUR-API-KEY" and "v123.4"', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script type="text/javascript" src="https://api.geolonia.com/v123.4/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </body></html>`).window

    const params = parseApiKey(mocDocument)
    assert.deepEqual('YOUR-API-KEY', params.key)
    assert.deepEqual('v123.4', params.stage)
  })
})
