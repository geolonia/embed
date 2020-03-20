/**
 * @file Entry for embed.js
 */

import 'intersection-observer'
import './style.css'
// import parseApiKey from './lib/parse-api-key'
// import GeoloniaMap from './lib/geolonia-map'
// import GeoloniaMarker from './lib/geolonia-marker'
// import * as util from './lib/util'

const script = document.createElement('script')
script.src = 'https://cdn.geolonia.com/mapboxgl/1.x/mapbox-gl.js'
document.body.appendChild(script)

const css = document.createElement('link')
css.rel = 'stylesheet'
css.href = 'https://cdn.geolonia.com/mapboxgl/1.x/mapbox-gl.css'
document.head.appendChild(css)

script.addEventListener('load', async () => {
  const parseApiKey = await import('./lib/parse-api-key')
  const GeoloniaMap = await import('./lib/geolonia-map')
  const GeoloniaMarker = await import('./lib/geolonia-marker')
  const util = await import('./lib/util')

  if ( util.checkPermission() ) {
    let isDOMContentLoaded = false
    const alreadyRenderedMaps = []
    const plugins = []

    /**
     *
     * @param {HTMLElement} target
     */
    const renderGeoloniaMap = target => {
      const map = new GeoloniaMap.default(target)
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
    const { key, stage } = parseApiKey.default(document)
    window.geolonia.accessToken = key
    window.geolonia.baseApiUrl = `https://api.geolonia.com/${stage}`
    window.geolonia.Map = GeoloniaMap.default
    window.geolonia.Marker = GeoloniaMarker.default
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
})
