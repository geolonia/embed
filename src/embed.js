/**
 * @file Entry for tilecloud.js
 */

import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'
import TilecloudMap from './lib/tilecloud-map'

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
    const map = new TilecloudMap(item.target)
    if (isDOMContentLoaded) {
      plugins.forEach(plugin => plugin(map, item.target))
    } else {
      alreadyRenderedMaps.push({ map, target: item.target })
    }
    observer.unobserve(item.target)
  })
})

const containers = document.querySelectorAll('.tilecloud')

for (let i = 0; i < containers.length; i++) {
  observer.observe(containers[i])
}

window.tilecloud = {
  Map: TilecloudMap,
  registerPlugin: plugin => {
    plugins.push(plugin)
    return void 0
  },
}

window.mapboxgl = mapboxgl
