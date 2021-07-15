/**
 * @file Entry for embed.js
 */

import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'
import GeoloniaMap from './lib/geolonia-map'
import GeoloniaMarker from './lib/geolonia-marker'
import { AmazonLocationServiceMapProvider } from './lib/providers/amazon'
import * as util from './lib/util'
import parseAtts from './lib/parse-atts'
import parseApiKey from './lib/parse-api-key'
import { version } from '../package.json'
import './lib/experimentals/web-components'

if ( util.checkPermission() ) {
  let isDOMContentLoaded = false
  const alreadyRenderedMaps = []
  const plugins = []

  /**
   *
   * @param {HTMLElement} target
   */
  const renderGeoloniaMap = target => {
    const map = new GeoloniaMap(target)

    // plugin
    const atts = parseAtts(target)
    if (isDOMContentLoaded) {
      plugins.forEach(plugin => plugin(map, target, atts))
    } else {
      alreadyRenderedMaps.push({ map, target: target, atts })
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    isDOMContentLoaded = true
    alreadyRenderedMaps.forEach(({ map, target, atts }) =>
      plugins.forEach(plugin => plugin(map, target, atts)),
    )
    // clear
    alreadyRenderedMaps.splice(0, alreadyRenderedMaps.length)
  })

  const observer = new IntersectionObserver(entries => {
    entries.forEach(item => {
      if (!item.isIntersecting) {
        return
      }
      renderGeoloniaMap(item.target)
      observer.unobserve(item.target)
    })
  })

  const containers = document.querySelectorAll('.geolonia[data-lazy-loading="off"]')
  const lazyContainers = document.querySelectorAll('.geolonia:not([data-lazy-loading="off"])')

  window.geolonia = window.mapboxgl = mapboxgl

  // This is required for correct initialization! Don't delete!
  const { key } = parseApiKey(document)
  if ('no-api-key' === key) {
    console.error('Missing API key.') // eslint-disable-line
  }

  window.geolonia.Map = GeoloniaMap
  window.geolonia.Marker = GeoloniaMarker
  window.geolonia.AmazonLocationServiceMapProvider = AmazonLocationServiceMapProvider
  window.geolonia.embedVersion = version
  window.geolonia.registerPlugin = plugin => {
    plugins.push(plugin)
    return void 0
  }

  // render Map immediately
  for (let i = 0; i < containers.length; i++) {
    renderGeoloniaMap(containers[i])
  }

  // set intersection observer
  for (let i = 0; i < lazyContainers.length; i++) {
    observer.observe(lazyContainers[i])
  }
} else {
  console.error( '[Geolonia] We are very sorry, but we can\'t display our map in iframe.' ) // eslint-disable-line
}
