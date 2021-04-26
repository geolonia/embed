import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill'
import mapboxgl from 'mapbox-gl'
import GeoloniaControl from '@geolonia/mbgl-geolonia-control'
import GestureHandling from './mbgl-gesture-handling'
import simpleStyle from './simplestyle'
import parseAtts from './parse-atts'

import * as util from './util'

const isCssSelector = string => {
  if (/^https?:\/\//.test(string)) {
    return false
  } else if (/^\//.test(string)) {
    return false
  } else if (/^\.\//.test(string)) {
    return false
  } else if (/^\.\.\//.test(string)) {
    return false
  } else {
    try {
      return document.querySelector(string)
    } catch (e) {
      return false
    }
  }
}

/**
 * Render the map
 *
 * @param container
 */
export class GeoloniaDefaultMap extends mapboxgl.Map {
  constructor(params) {
    const container = util.getContainer(params)
    const atts = parseAtts(container)

    const options = util.getOptions(container, params, atts)

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

    // Pass API key to `/sources` (tile json).
    const _transformRequest = options.transformRequest
    options.transformRequest = (url, resourceType) => {
      if (resourceType === 'Source' && url.startsWith('https://api.geolonia.com')) {
        url = `${atts.apiUrl}/sources`
        return {
          url: `${url}?key=${atts.key}`,
          headers: { 'X-Geolonia-Api-Key': atts.key },
        }
      }

      // Additional transformation
      if (typeof _transformRequest === 'function') {
        return _transformRequest(url, resourceType)
      }
    }

    // Generate Map
    super(options)
    console.log(options)
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

      if (atts['3d']) {
        const style = map.getStyle()
        style.layers.forEach(layer => {
          if ('on' === atts['3d'] && layer.metadata && true === layer.metadata['visible-on-3d']) {
            map.setLayoutProperty(layer.id, 'visibility', 'visible')
          } else if ('off' === atts['3d'] && layer.metadata && true === layer.metadata['visible-on-3d']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          } else if ('on' === atts['3d'] && layer.metadata && true === layer.metadata['hide-on-3d']) {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          } else if ('off' === atts['3d'] && layer.metadata && true === layer.metadata['hide-on-3d']) {
            map.setLayoutProperty(layer.id, 'visibility', 'visible')
          }
        })
      }
    })

    return map
  }

  /**
   *
   * @param {string|null} style style identity or `null` when map.remove()
   * @param {*} options
   */
  setStyle(style, options = {}) {
    if (style !== null) {
    // It can't access `this` because `setStyle()` will be called with `super()`.
    // So, we need to run `parseAtts()` again(?)
      const atts = parseAtts(this.getContainer())

      // If style is object, it must be passed as it.
      if ('string' === typeof style) {
        style = util.getStyle(style, atts)
      }
    }

    // Calls `mapboxgl.Map.setStyle()`.
    super.setStyle.call(this, style, options)
  }
}

// Prevent `.geolonia` to be rendered with `new window.geolonia.Map()`
export class GeoloniaMap extends GeoloniaDefaultMap {
  constructor(params) {
    const container = util.getContainer(params)
    if (container.classList.contains('geolonia')) {
      throw new Error('You cannot use　`class=geolonia` with `new geolonia.Map`.')
    } else {
      super(params)
    }
  }
}
