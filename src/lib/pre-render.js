import mapboxgl from 'mapbox-gl'
import { loadCssOnce } from './load-css'
import { isDisplayed } from './bound'
import defaultControls from './default-controls'

// stores map container ids already rendered to prevent run twice
const onceRendered = {}

/**
 * render map if it in users view
 * @param  {HTMLElement|HTMLElement[]} containerArg rendering container
 * @return {Promise}                              Promise to all all map has started rendering
 */
export const preRender = (containerArg, styleUrl) => {
  // load once
  loadCssOnce()

  const mapOptionsBase = {
    style: styleUrl,
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
    hash: true,
  }

  // normalize
  const containers = Array.isArray(containerArg) ? containerArg : [containerArg]
  return Promise.all(
    containers.map(container => {
      return new Promise((resolve, reject) => {
        // define scroll handler
        const onScrollEventHandler = () => {
          const elementId = container.id
          if (
            !onceRendered[elementId] &&
            isDisplayed(container, { buffer: 100 })
          ) {
            onceRendered[elementId] = true
            let map
            try {
              const lat = parseFloat(container.dataset.lat)
              const lng = parseFloat(container.dataset.lng)
              const zoom = parseFloat(container.dataset.zoom)
              const center = lat && lng && [lat, lng]

              const mapOptions = {
                ...mapOptionsBase,
                container,
                center: center ? center : mapOptionsBase.center,
                zoom: zoom || mapOptionsBase.center,
              }
              map = new mapboxgl.Map(mapOptions)
              defaultControls.forEach(control => map.addControl(control))
              center && new mapboxgl.Marker().setLngLat(center).addTo(map)
            } catch (e) {
              reject(e)
            } finally {
              // handler should fire once
              window.removeEventListener('scroll', onScrollEventHandler)
              // check all finished
              resolve(map)
            }
          }
        }

        // enable handler
        window.addEventListener('scroll', onScrollEventHandler, false)

        // detect whether map are already in view
        onScrollEventHandler()
      })
    }),
  )
}

export default preRender
