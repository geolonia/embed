const assert = require('assert')
const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const http = require('http')
const { isWhiteout } = require('./util')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

describe('Tests for Maps.', () => {
  let browser
  let page
  let embedServer
  const capturedErrors = []
  const reports = []

  before(async () => {
    const embed = (
      await fs.readFile(path.resolve(__dirname, '..', 'dist', 'embed.js'))
    ).toString()
    embedServer = http.createServer((request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/javascirpt' })
      response.write(embed)
      response.end()
    })
    embedServer.listen(8080)

    // prepare pupeteer
    browser = await puppeteer.launch()
    page = await browser.newPage()

    // navigation
    const template = await (
      await fs.readFile(path.resolve(__dirname, 'assets', 'map.html.template'))
    ).toString()
    const content = template
      .replace(/%ORIGIN%/g, 'http://127.0.0.1:8080')
      .replace(/%API_KEY%/g, process.env.GEOLONIA_API_KEY)
    await page.goto('https://geolonia.com')
    page.on('pageerror', error => capturedErrors.push(error))
    await page.setContent(content)
    await sleep(5000)
  })

  after(async () => {
    reports.forEach(report => process.stdout.write(`[report] ${report}\n`))
    await browser.close()
    embedServer.close()
  })

  it('should not emit JS errors', () => {
    assert.strictEqual(capturedErrors.length, 0)
  })

  it('should build DOM as expected', async () => {
    const map = await page.$('#map div:first-child')
    const className = await (await map.getProperty('className')).jsonValue()
    assert.strictEqual('mapboxgl-canary', className)
  })

  it('should render map', async () => {
    const nextImage = await page.screenshot()
    const whiteoutRate = await isWhiteout(nextImage)

    reports.push(
      `白色(#fefefe - #ffffff) の占める割合: ${
        Math.round(10000 * whiteoutRate) / 100
      }%`,
    )
    // Store the image for human
    await fs.writeFile(
      path.resolve('__dirname', '..', 'snapshots', 'map.png'),
      nextImage,
    )

    assert.strictEqual(whiteoutRate < 0.8, true)
  })
})
