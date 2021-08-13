import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill'
import mapboxgl from 'mapbox-gl'
import GeoloniaControl from '@geolonia/mbgl-geolonia-control'
import GestureHandling from '@geolonia/mbgl-gesture-handling'
import SimpleStyle from './simplestyle'
import SimpleStyleVector from './simplestyle-vector'
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
export default class GeoloniaMap extends mapboxgl.Map {
  constructor(params) {
    const container = util.getContainer(params)
    if (container.geoloniaMap) {
      return container.geoloniaMap
    }

    const atts = parseAtts(container, params)
    const options = util.getOptions(container, params, atts)

    // Getting content should be fire just before initialize the map.
    const content = container.innerHTML.trim()
    container.innerHTML = ''

    let loading
    if ('off' !== atts.loader) {
      loading = document.createElement('div')
      // prevent pinchin & pinchout
      loading.addEventListener('touchmove', e => {
        if (e.touches && 1 < e.touches.length) {
          e.preventDefault()
        }
      })
      loading.className = 'loading-geolonia-map'
      loading.innerHTML = `<div class="lds-grid"><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div><div></div><div></div></div>`
      container.appendChild(loading)
    }

    const sessionId = util.getSessionId(40)
    let sourcesUrl = new URL(`${atts.apiUrl}/sources`)
    if (options.baseTilesVersion !== '') {
      sourcesUrl = new URL(`${atts.apiUrl}/sources_v2`)
      sourcesUrl.searchParams.set('ver', options.baseTilesVersion)
    }
    sourcesUrl.searchParams.set('key', atts.key)
    sourcesUrl.searchParams.set('sessionId', sessionId)

    let __insertRefreshedAuthParams
    // Pass API key and requested tile version to `/sources` (tile json).
    const _transformRequest = options.transformRequest
    options.transformRequest = (url, resourceType) => {
      if (resourceType === 'Source' && url.startsWith('https://api.geolonia.com')) {
        return {
          url: sourcesUrl.toString(),
        }
      }
      if (resourceType === 'Source' && url.match(/^https:\/\/tileserver(-[^.]+)?\.geolonia\.com/)) {
        const tileserverSourcesUrl = new URL(url)
        tileserverSourcesUrl.searchParams.set('sessionId', sessionId)
        tileserverSourcesUrl.searchParams.set('key', atts.key)
        return {
          url: tileserverSourcesUrl.toString(),
        }
      }

      let request
      // Additional transformation
      if (typeof _transformRequest === 'function') {
        request = _transformRequest(url, resourceType)
      }

      if (typeof __insertRefreshedAuthParams !== 'undefined') {
        request = __insertRefreshedAuthParams(request, url)
      }

      return request
    }

    // Generate Map
    super(options)
    const map = this
    this.geoloniaSourcesUrl = sourcesUrl
    this.__styleExtensionLoadRequired = true

    // this function requires `this`, which is not set before `super`
    __insertRefreshedAuthParams = (request, url) => {
      if (typeof this._currentAuthParams !== 'undefined') {
        const purl = new URL((request && request.url) || url)
        const q = purl.searchParams
        if (q.get('key') && q.get('expires') && q.get('Policy') && q.get('Key-Pair-Id')) {
          purl.search = this._currentAuthParams

          return {
            url: purl.toString(),
          }
        }
      }
      return request
    }

    // Note: GeoloniaControl should be placed before another controls.
    // Because this control should be "very" bottom-left(default) or the attributed position.
    const { position: geoloniaControlPosition } = util.parseControlOption(atts.geoloniaControl)
    map.addControl(new GeoloniaControl(),  geoloniaControlPosition)

    const { enabled: fullscreenControlEnabled, position: fullscreenControlPosition } = util.parseControlOption(atts.fullscreenControl)
    if (fullscreenControlEnabled) {
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
      map.addControl(new window.geolonia.FullscreenControl(), fullscreenControlPosition)
    }

    const { enabled: navigationControlEnabled, position: navigationControlPosition } = util.parseControlOption(atts.navigationControl)
    if (navigationControlEnabled) {
      map.addControl(new window.geolonia.NavigationControl(), navigationControlPosition)
    }

    const { enabled: geolocateControlEnabled, position: geolocateControlPosition } = util.parseControlOption(atts.geolocateControl)
    if (geolocateControlEnabled) {
      map.addControl(new window.geolonia.GeolocateControl(), geolocateControlPosition)
    }

    const { enabled: scaleControlEnabled, position: scaleControlPosition } = util.parseControlOption(atts.scaleControl)
    if (scaleControlEnabled) {
      map.addControl(new window.geolonia.ScaleControl(),  scaleControlPosition)
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

      if (options.baseTilesVersion !== '') {
        // トークンが60分で失効するので毎20分で更新する
        map._tileUrlRefreshIntervalId = setInterval(map.refreshTileUrls, 1800000)
      }
    })

    map.on('styledata', event => {
      const map = event.target

      if (!this.__styleExtensionLoadRequired) {
        return
      }
      this.__styleExtensionLoadRequired = false

      if (atts.simpleVector) {
        const simpleVectorAttributeValue = util.parseSimpleVector(atts.simpleVector, atts.customtileUrl)
        new SimpleStyleVector(simpleVectorAttributeValue).addTo(map)
      }

      if (atts.geojson) {
        const el = isCssSelector(atts.geojson)
        if (el) {
          const json = JSON.parse(el.textContent)
          new SimpleStyle(json, {
            cluster: ('on' === atts.cluster),
            clusterColor: atts.clusterColor,
          }).addTo(map)
        } else {
          fetch(atts.geojson).then(response => {
            return response.json()
          }).then(json => {
            new SimpleStyle(json, {
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

    container.geoloniaMap = map

    return map
  }

  async refreshTileUrls() {
    const resp = await fetch(this.geoloniaSourcesUrl)
    if (!resp.ok) {
      // Error
      return
    }
    const sources = await resp.json()
    const url = new URL(sources.tiles[0])
    this._currentAuthParams = url.searchParams
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
      // Run parseAtts again to get the latest values from DOM.
      const atts = parseAtts(this.getContainer())

      // If style is object, it must be passed as it.
      if ('string' === typeof style) {
        style = util.getStyle(style, atts)
      }
    }

    // Tell the `styledata` event handler to load style extensions again
    this.__styleExtensionLoadRequired = true
    // Calls `mapboxgl.Map.setStyle()`.
    super.setStyle.call(this, style, options)
  }
}
