import parseApiKey from './parse-api-key'
import { JSDOM } from 'jsdom'
import assert from 'assert'

describe('not parse api key from dom', () => {
  it('should not parse with tilecloud flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/tilecloud.js?key=abc"></script>
    </body></html>`).window

    const apiKey = parseApiKey(mocDocument)
    assert.equal(apiKey, void 0)
  })
})
