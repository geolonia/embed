import mapboxgl from 'mapbox-gl'
import { isDisplayed } from './bound'
import defaultControls from './default-controls'

/**
 * ex. start rendering if map.top - screen.bottom < 100px
 * @type {number}
 */
const defaultBuffer = 100

// stores map container ids already rendered to prevent run twice
const onceRendered = {}

/**
 * render map if it in users view
 * @param  {{container:HTMLElement, style: object}} maps          map container element and it's style
 * @param  {object|void}                            renderOptions option for rendering
 * @return {Promise}                                              Promise to all all map has started rendering
 */
export const preRender = (maps, renderOptions) => {
  const { buffer = defaultBuffer } = renderOptions || { buffer: defaultBuffer }

  const mapOptionsBase = {
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
    hash: false,
  }

  // normalize
  const _maps = Array.isArray(maps) ? maps : [maps]

  return Promise.all(
    _maps.map(({ container, style }) => {
      return new Promise((resolve, reject) => {
        // define scroll handler
        const onScrollEventHandler = () => {
          const elementId = container.id
          const content = container.innerHTML.trim()
          if (!onceRendered[elementId] && isDisplayed(container, { buffer })) {
            onceRendered[elementId] = true
            let map
            try {
              const lat = parseFloat(container.dataset.lat)
              const lng = parseFloat(container.dataset.lng)
              const zoom = parseFloat(container.dataset.zoom)
              const hash =
                (container.dataset.hash || 'false').toUpperCase() === 'TRUE'
              const center = lat && lng ? [lng, lat] : false

              const mapOptions = {
                style,
                ...mapOptionsBase,
                container,
                center: center ? center : mapOptionsBase.center,
                zoom: zoom || mapOptionsBase.center,
                hash,
              }
              map = new mapboxgl.Map(mapOptions)
              defaultControls.forEach(control => map.addControl(control))
              if (center) {
                const marker = new mapboxgl.Marker().setLngLat(center).addTo(map)
                if (content) {
                  const popup = new mapboxgl.Popup().setHTML(content)
                  marker.setPopup(popup)
                }
              }
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
