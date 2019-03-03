import parseApiKey from './parse-api-key'
import { JSDOM } from 'jsdom'
import assert from 'assert'

describe('parse api key from dom', () => {
  it('should parse with tilecloud flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/tilecloud.js?tilecloud=true&apiKey=abc"></script>
    </body></html>`).window

    const apiKey = parseApiKey(mocDocument)
    assert.equal(apiKey, 'abc')
  })

  describe('known hosts', () => {
    const hosts = ['foo.tilecloud.io', 'tilecloud.github.io']

    hosts.forEach(host =>
      it(`should parse with known host ${host}`, () => {
        const { document: mocDocument } = new JSDOM(`<html><body>
          <script src="https://${host}/tilecloud.js?apiKey=abc"></script>
        </body></html>`).window

        const apiKey = parseApiKey(mocDocument)
        assert.equal(apiKey, 'abc')
      }),
    )
  })
})

describe('not parse api key from dom', () => {
  it('should not parse with tilecloud flag', () => {
    const { document: mocDocument } = new JSDOM(`<html><body>
      <script src="https://external.example.com/tilecloud.js?apiKey=abc"></script>
    </body></html>`).window

    const apiKey = parseApiKey(mocDocument)
    assert.equal(apiKey, void 0)
  })
})
