import mapboxgl from 'mapbox-gl'
import { loadCssOnce } from './lib/css-loader'
import { fetchStyle } from './lib/requests'
import { isInView } from './lib/check-element-bounds'
import defaultOptions from './default-options'
import defaultControls from './default-controls'
import parseParams from './parse-params'

const { containerId, apiKey } = parseParams()

/**
 * stores map container ids already rendered to prevent run twice
 * @type {Object}
 */
const onceRendered = {}

const {
  mapOptions: defaultMapOptions,
  lazyOptions: defaultLazyOptions,
} = defaultOptions

/**
 * render map if it in users view
 * @param  {object|string} arg           map options
 * @param  {string}        apiKey        tilecloud api key
 * @param  {object}        [lazyOpts={}] lazy rendering options
 * @return {Promise}                     Promise for render started
 */
export const render = (arg, apiKey, lazyOpts = {}) => {
  let mapOpts

  if (typeof arg === 'string') {
    mapOpts = { container: arg }
  } else if (typeof arg === 'object' && typeof arg.container === 'string') {
    mapOpts = arg
  } else {
    throw new Error('Invalid argument: ' + JSON.stringify(arg))
  }

  // load once
  loadCssOnce()

  const mapOptions = { ...defaultMapOptions(apiKey), ...mapOpts }
  const lazyOptions = { ...defaultLazyOptions, ...lazyOpts }

  const elementId = mapOptions.container

  return fetchStyle(mapOptions.style).then(
    () =>
      new Promise((resolve, reject) => {
        // define scroll handler
        const onScrollEventHandler = () => {
          if (!onceRendered[elementId] && isInView(elementId, lazyOptions)) {
            onceRendered[elementId] = true

            let map
            try {
              map = new mapboxgl.Map(mapOptions)
              defaultControls.forEach(map.addControl)
            } catch (e) {
              reject(e)
            } finally {
              // handler should fire once
              window.removeEventListener('scroll', onScrollEventHandler)
              resolve(map)
            }
          }
        }

        // enable handler
        window.addEventListener('scroll', onScrollEventHandler, false)

        // detect whether map are already in view
        onScrollEventHandler()
      }),
  )
}

// GO!
render(containerId, apiKey)
