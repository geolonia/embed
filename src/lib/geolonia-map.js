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

const isCssSelector = string => {
  try {
    return document.querySelector(string)
  } catch (e) {
    return false
  }
}

/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMap extends mapboxgl.Map {
  constructor(params) {
    const container = util.getContainer(params)
    const atts = parseAtts(container)

    let lang = 'atuo'
    if ('auto' === atts.lang) {
      lang = util.getLang()
    } else if ('ja' === atts.lang) {
      lang = 'ja'
    } else {
      lang = 'en'
    }

    let style = atts.style || params.style
    if (!util.isURL(style)) {
      style = getStyleURL(atts.style, atts.key, atts.stage)
      if ('ja' !== lang) {
        style = getStyleURL(atts.style, atts.key, atts.stage, 'en')
      }
    }

    delete params.container // Don't overwrite container.

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
      ...params,
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

    // Note: GeoloniaControl should be placed before another controls.
    // Because this control should be "very" bottom-left.
    map.addControl(new GeoloniaControl())

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
      map.addControl(new window.geolonia.FullscreenControl())
    }

    if ('on' === atts.navigationControl) {
      map.addControl(new window.geolonia.NavigationControl())
    }

    if ('on' === atts.geolocateControl) {
      map.addControl(new window.geolonia.GeolocateControl())
    }

    if ('on' === atts.scaleControl) {
      map.addControl(new window.geolonia.ScaleControl())
    }

    map.on('load', event => {
      const map = event.target

      if ('off' !== atts.loader) {
        try {
          container.removeChild(loading)
        } catch (e) {
          // Nothing to do.
        }
      }

      if ('off' !== atts.gestureHandling && util.isScrollable()) {
        new GestureHandling({ lang: atts.lang }).addTo(map)
      }

      if (atts.lat && atts.lng && 'on' === atts.marker) {
        if (content) {
          const popup = new window.geolonia.Popup().setHTML(content)
          let marker
          if (atts.customMarker) {
            const offset = atts.customMarkerOffset.split(/,/).map(n => {
              return Number(n.trim())
            })
            const container = document.querySelector(atts.customMarker)
            container.style.display = 'block'
            marker = new window.geolonia.Marker({
              element: container,
              offset: offset,
            }).setLngLat(options.center).addTo(map).setPopup(popup)
          } else {
            marker = new window.geolonia.Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map).setPopup(popup)
          }
          if ('on' === atts.openPopup) {
            marker.togglePopup()
          }
          marker.getElement().classList.add('geolonia-clickable-marker')
        } else {
          new window.geolonia.Marker({ color: atts.markerColor }).setLngLat(options.center).addTo(map)
        }
      }

      if (atts.geojson) {
        const el = isCssSelector(atts.geojson)
        if (el) {
          const json = JSON.parse(el.textContent)
          new simpleStyle(json, {
            cluster: ('on' === atts.cluster),
            clusterColor: atts.clusterColor,
          }).addTo(map)
        } else {
          fetch(atts.geojson).then(response => {
            return response.json()
          }).then(json => {
            new simpleStyle(json, {
              cluster: ('on' === atts.cluster),
              clusterColor: atts.clusterColor,
            }).addTo(map)
          })
        }
      }
    })

    return map
  }
}
