import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill'
import mapboxgl from 'mapbox-gl'
import GeoloniaControl from '@geolonia/mbgl-geolonia-control'
import GestureHandling from './mbgl-gesture-handling'
import simpleStyle from './simplestyle'
import parseAtts from './parse-atts'

import * as util from './util'

const getStyleURL = (styleName, userKey, stage = 'dev', lang = '') => {
  if ('en' === lang) {
    return `https://api.geolonia.com/${stage}/styles/${styleName}?key=${userKey}&lang=en`
  } else {
    return `https://api.geolonia.com/${stage}/styles/${styleName}?key=${userKey}`
  }
}

const isValidUrl = string => /^https?:\/\//.test(string)

/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMap extends mapboxgl.Map {
  constructor(container) {
    const atts = parseAtts(container)

    let lang = 'ja'
    if ('auto' === atts.lang) {
      lang = util.getLang()
    } else if ('ja' !== atts.lang) {
      lang = 'en'
    }

    let style = util.isURL(atts.style)
    if (!style) {
      style = getStyleURL(atts.style, atts.key, atts.stage)
      if ('ja' !== lang) {
        style = getStyleURL(atts.style, atts.key, atts.stage, 'en')
      }
    }

    const options = {
      style,
      container,
      center: [parseFloat(atts.lng), parseFloat(atts.lat)],
      bearing: parseFloat(atts.bearing),
      pitch: parseFloat(atts.pitch),
      zoom: parseFloat(atts.zoom),
      hash: ('on' === atts.hash),
      localIdeographFontFamily: 'sans-serif',
      attributionControl: true,
    }

    // Getting content should be fire just before initialize the map.
    const content = container.innerHTML.trim()
    container.innerHTML = ''

    let loading
    if ('off' !== atts.loader) {
      loading = document.createElement('div')
      loading.className = 'loading-geolonia-map'
      loading.innerHTML = `<div class="lds-grid"><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div></div>`
      container.appendChild(loading)
    }

    super(options)
    const map = this

    map.addControl(new GeoloniaControl())

    if ('off' !== atts.gestureHandling) {
      new GestureHandling({ lang: atts.lang }).addTo(map)
    }

    if ('on' === atts.fullscreenControl) {
      // IE patch for fullscreen mode
      if (!container.classList.contains('geolonia')) {
        document.onmsfullscreenchange = () => {
          const isFullscreen = document.msFullscreenElement === container
          if (isFullscreen) {
            map._beforeFullscreenWidth = container.style.width
            map._beforeFullscreenHeight = container.style.height
            container.style.width = '100%'
            container.style.height = '100%'
          } else {
            container.style.width = map._beforeFullscreenWidth
            container.style.height = map._beforeFullscreenHeight
          }
        }
      }
      map.addControl(new mapboxgl.FullscreenControl())
    }

    if ('on' === atts.navigationControl) {
      map.addControl(new mapboxgl.NavigationControl())
    }

    if ('on' === atts.geolocateControl) {
      map.addControl(new mapboxgl.GeolocateControl())
    }

    if ('on' === atts.scaleControl) {
      map.addControl(new mapboxgl.ScaleControl())
    }

    map.on('load', event => {
      if ('off' !== atts.loader) {
        try {
          container.removeChild(loading)
        } catch (e) {
          // Nothing to do.
        }
      }

      const map = event.target
      if (atts.lat && atts.lng && 'on' === atts.marker) {
        if (content) {
          const popup = new mapboxgl.Popup().setHTML(content)
          let marker
          if (atts.customMarker) {
            const container = document.querySelector(atts.customMarker)
            container.style.display = 'block'
            marker = new mapboxgl.Marker(container).setLngLat(options.center).addTo(map).setPopup(popup)
          } else {
            marker = new mapboxgl.Marker().setLngLat(options.center).addTo(map).setPopup(popup)
          }
          if ('on' === atts.openPopup) {
            marker.togglePopup()
          }
          marker.getElement().classList.add('geolonia-clickable-popup')
        } else {
          new mapboxgl.Marker().setLngLat(options.center).addTo(map)
        }
      }

      if (atts.geojson) {
        if (isValidUrl(atts.geojson)) {
          fetch(atts.geojson).then(response => {
            return response.json()
          }).then(json => {
            new simpleStyle(json, {
              cluster: ('on' === atts.cluster),
              clusterColor: atts.clusterColor,
            }).addTo(map)
          })
        } else {
          const el = document.querySelector(atts.geojson)
          if (el) {
            const json = JSON.parse(el.textContent)
            new simpleStyle(json, {
              cluster: ('on' === atts.cluster),
              clusterColor: atts.clusterColor,
            }).addTo(map)
          }
        }
      }
    })

    return map
  }
}
