/**
 * @file Entry for tilecloud.js
 */

import 'intersection-observer'
import 'mapbox-gl/dist/mapbox-gl.css'
import TilecloudMap from './lib/tilecloud-map'

window.tilecloud = {}

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
        window.tilecloud.Map = Map
      })

    observer.unobserve(item.target)
  })
})

const containers = document.querySelectorAll('.tilecloud')

for (let i = 0; i < containers.length; i++) {
  observer.observe(containers[i])
}
