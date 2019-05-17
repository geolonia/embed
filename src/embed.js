/**
 * @file Entry for tilecloud.js
 */

import 'intersection-observer'
import 'mapbox-gl/dist/mapbox-gl.css'
import TilecloudMap from './lib/tilecloud-map'

const tilecloudMapQueue = []

class ObserverBeforeLoad {
  constructor(...args) {
    return new Promise((resolve, reject) => tilecloudMapQueue.push({ args, resolve, reject }))
  }
}

window.tilecloud = { Map: ObserverBeforeLoad }

const observer = new IntersectionObserver(entries => {
  entries.forEach(item => {
    if (!item.isIntersecting) {
      return
    }

    import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl/dist/mapbox-gl.js')
      .then(mapboxgl => {
        const Map = TilecloudMap(mapboxgl)
        new Map(item.target)
        window.mapboxgl = mapboxgl
        // replace
        while (tilecloudMapQueue.length > 0) {
          const { args, resolve, reject } = tilecloudMapQueue.pop()
          let map
          try {
            map = new Map(...args)
            resolve(map)
          } catch (e) {
            reject(e)
          }
        }
        window.tilecloud.Map = Map
      })

    observer.unobserve(item.target)
  })
})

const containers = document.querySelectorAll('.tilecloud')

for (let i = 0; i < containers.length; i++) {
  observer.observe(containers[i])
}
