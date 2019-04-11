import parseApiKey from './parse-api-key'
import { JSDOM } from 'jsdom'
import assert from 'assert'

describe('parse api key from dom', () => {
  it('should parse with tilecloud flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/?tilecloud-api-key=abc"></script>
    </body></html>`).window

    const apiKey = parseApiKey(mocDocument)
    assert.deepEqual('abc', apiKey)
  })
  it('should parse with tilecloud flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/jquery.js"></script>
      <script src="https://external.example.com/?tilecloud-api-key=def"></script>
    </body></html>`).window

    const apiKey = parseApiKey(mocDocument)
    assert.deepEqual('def', apiKey)
  })
})
