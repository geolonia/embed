const assert = require('assert')
const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const path = require('path')
const http = require('http')
const { isWhiteout } = require('./util')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

describe('Tests for Maps.', () => {
  let browser
  let embedServer

  before(async () => {
    browser = await puppeteer.launch()
    const embed = (
      await fs.readFile(path.resolve(__dirname, '..', 'dist', 'embed.js'))
    ).toString()
    embedServer = http.createServer((request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/javascirpt' })
      response.write(embed)
      response.end()
    })
    embedServer.listen(8080)
  })

  after(async () => {
    await browser.close()
    embedServer.close()
  })

  it('The map should be displayed as expected', async () => {
    // navigation
    const template = await (
      await fs.readFile(path.resolve(__dirname, 'assets', 'map.html.template'))
    ).toString()
    const content = template
      .replace(/%ORIGIN%/g, 'http://127.0.0.1:8080')
      .replace(/%API_KEY%/g, process.env.GEOLONIA_API_KEY)
    const page = await browser.newPage()
    await page.goto('https://geolonia.com')
    await page.setContent(content)
    await sleep(10000)

    // pixel testing
    const nextImage = await page.screenshot()
    const whiteoutRate = await isWhiteout(nextImage)
    process.stdout.write(`[test] 白色(#fefefe - #ffffff) の閉める割合: ${Math.round(10000 * whiteoutRate) / 100}%`)
    await fs.writeFile(path.resolve('__dirname', '..', 'snapshots', 'map.png'), nextImage)
    assert.strictEqual(whiteoutRate < 0.8, true)

    // DOM testing
    const map = await page.$('#map div:first-child')
    const className = await (await map.getProperty('className')).jsonValue()
    assert.strictEqual('mapboxgl-canary', className)
  }, 20000)
})
