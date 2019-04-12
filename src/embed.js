/**
 * @file Entry for tilecloud.js
 */

import '@babel/polyfill'
import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import TilecloudMap from './lib/tilecloud-map'

const observer = new IntersectionObserver(entries => {
  entries.forEach(item => {
    if (!item.isIntersecting) {
      return
    }
    new TilecloudMap(item.target)
    observer.unobserve(item.target)
  })
})

const containers = document.querySelectorAll('.tilecloud')

containers.forEach(container => {
  observer.observe(container)
})

window.tilecloud = {
  Map: TilecloudMap,
  mapboxgl,
}
