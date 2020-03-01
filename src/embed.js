/**
 * @file Entry for embed.js
 */

import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'
import GeoloniaMap from './lib/geolonia-map'

if ( window === window.parent ) {
  let isDOMContentLoaded = false
  const alreadyRenderedMaps = []
  const plugins = []

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
      const map = new GeoloniaMap(item.target)
      if (isDOMContentLoaded) {
        plugins.forEach(plugin => plugin(map, item.target))
      } else {
        alreadyRenderedMaps.push({ map, target: item.target })
      }
      observer.unobserve(item.target)
    })
  })

  const containers = document.querySelectorAll('.tilecloud, .geolonia')

  for (let i = 0; i < containers.length; i++) {
    observer.observe(containers[i])
  }

  window.geolonia = mapboxgl
  window.geolonia.Map = GeoloniaMap
  window.geolonia.registerPlugin = plugin => {
    plugins.push(plugin)
    return void 0
  }

  // for backward compatibility
  window.tilecloud = window.geolonia

  window.mapboxgl = mapboxgl
} else {
  console.error( '[Geolonia] We are very sorry, but we can\'t display our map in iframe.' ) // eslint-disable-line
}
