/**
 * @file Entry for tilecloud.js
 */

import 'intersection-observer'
import 'mapbox-gl/dist/mapbox-gl.css'
import TilecloudMap from './lib/tilecloud-map'
import {
  MapBeforeLoad,
  MapAfterLoad,
  mapRenderingQueue,
} from './lib/ex-map-class'

let onceIntersected = false
window.tilecloud = {}
window.tilecloud.Map = MapBeforeLoad

const observer = new IntersectionObserver(entries => {
  entries.forEach(item => {
    if (!item.isIntersecting) {
      return
    }

    import('mapbox-gl/dist/mapbox-gl.js').then(mapboxgl => {
      const MbglMap = TilecloudMap(mapboxgl)
      new MbglMap(item.target)

      if (!onceIntersected) {
        onceIntersected = true
        window.mapboxgl = mapboxgl
        window.tilecloud.Map = MapAfterLoad(MbglMap)

        while (mapRenderingQueue.length > 0) {
          const { args, resolve, reject } = mapRenderingQueue.pop()
          try {
            resolve(new MbglMap(...args))
          } catch (e) {
            reject(e)
          }
        }
      }
    })

    observer.unobserve(item.target)
  })
})

const containers = document.querySelectorAll('.tilecloud')

for (let i = 0; i < containers.length; i++) {
  observer.observe(containers[i])
}
