import mapboxgl from 'mapbox-gl'
import { loadCssOnce } from './lib/css-loader'
import { fetchStyle } from './lib/requests'
import { isDisplayed } from './lib/bound'
import defaultControls from './default-controls'

const MAP_TYPES = {
  BASIC: 'tilecloud-basic',
}

const STYLE_URL = {
  [MAP_TYPES.BASIC]: 'https://tilecloud.github.io/tiny-tileserver/style.json',
}

const API_KEY = 'anonymous'

/**
 * stores map container ids already rendered to prevent run twice
 * @type {Object}
 */
const onceRendered = {}

const mapCounter = {}

const basicMapContainers = Array.prototype.slice.call(
  document.getElementsByClassName(MAP_TYPES.BASIC),
)

// provide unique ids
basicMapContainers.forEach(element => {
  if (!element.id) {
    mapCounter[MAP_TYPES.BASIC]
      ? mapCounter[MAP_TYPES.BASIC]++
      : (mapCounter[MAP_TYPES.BASIC] = 0)
    element.id = `__${MAP_TYPES.BASIC}_${mapCounter[MAP_TYPES.BASIC]}`
  }
})

/**
 * render map if it in users view
 * @param  {object}        [lazyOpts={}] lazy rendering options
 * @return {Promise}                     Promise for render started
 */
export const preRender = (containers, mapType, apiKey) => {
  // load once
  loadCssOnce()

  const mapOptionsBase = {
    style: `${STYLE_URL[mapType]}?apiKey=${apiKey}`,
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
  }

  return fetchStyle(mapOptionsBase.style).then(
    () =>
      new Promise((resolve, reject) => {
        // define scroll handler
        const onScrollEventHandler = () => {
          containers.forEach(container => {
            const elementId = container.id
            const { lat, lng, zoom } = container.dataset
            console.log(lat, lng, zoom)
            if (
              !onceRendered[elementId] &&
              isDisplayed(container, { buffer: 100 })
            ) {
              onceRendered[elementId] = true
              const mapOptions = {
                ...mapOptionsBase,
                container,
              }
              let map
              try {
                map = new mapboxgl.Map(mapOptions)
                defaultControls.forEach(control => map.addControl(control))
              } catch (e) {
                reject(e)
              } finally {
                // handler should fire once
                window.removeEventListener('scroll', onScrollEventHandler)
                resolve(map)
              }
            }
          })
        }

        // enable handler
        window.addEventListener('scroll', onScrollEventHandler, false)

        // detect whether map are already in view
        onScrollEventHandler()
      }),
  )
}

// GO!
preRender(basicMapContainers, MAP_TYPES.BASIC, API_KEY)
