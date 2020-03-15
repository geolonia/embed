/**
 * @file Entry for embed.js
 */

import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'
import parseApiKey from './lib/parse-api-key'
import GeoloniaMap from './lib/geolonia-map'
import GeoloniaMarker from './lib/geolonia-marker'
import * as util from './lib/util'

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
    if (isDOMContentLoaded) {
      plugins.forEach(plugin => plugin(map, target))
    } else {
      alreadyRenderedMaps.push({ map, target: target })
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    isDOMContentLoaded = true
    alreadyRenderedMaps.forEach(({ map, target }) =>
      plugins.forEach(plugin => plugin(map, target)),
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

  const containers = document.querySelectorAll('.geolonia[data-lazy="off"]')
  const lazyContainers = document.querySelectorAll('.geolonia:not([data-lazy="off"])')

  window.geolonia = mapboxgl
  window.geolonia.geolonia = parseApiKey(document)
  window.geolonia.Map = GeoloniaMap
  window.geolonia.Marker = GeoloniaMarker
  window.geolonia.registerPlugin = plugin => {
    plugins.push(plugin)
    return void 0
  }

  window.mapboxgl = mapboxgl

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
