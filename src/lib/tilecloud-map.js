import 'whatwg-fetch'
import 'promise-polyfill/src/polyfill'
import mapboxgl from 'mapbox-gl'
import TilecloudControl from '@tilecloud/mbgl-tilecloud-control'
import GestureHandling from './mbgl-gesture-handling'
import simpleStyle from './simplestyle'
import parseAtts from './parse-atts'

const getStyleURL = (styleName, userKey, stage = 'v1') => {
  return `https://api.tilecloud.io/${stage}/styles/${styleName}?key=${userKey}`
}

const isValidUrl = string => /^https:\/\//.test(string)

/**
 * Render the map
 *
 * @param container
 */
export default class TilecloudMap extends mapboxgl.Map {
  constructor(container) {
    const atts = parseAtts(container)

    const options = {
      style: getStyleURL(atts.style, atts.key),
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

    super(options)
    const map = this

    map.addControl(new TilecloudControl())

    if ('on' === atts.gestureHandling) {
      new GestureHandling().addTo(map)
    }

    if ('on' === atts.fullscreenControl) {
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
      const map = event.target
      if (options.center && 'on' === atts.marker) {
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
        } else {
          new mapboxgl.Marker().setLngLat(options.center).addTo(map)
        }
      }

      if (atts.geojson) {
        if (isValidUrl(atts.geojson)) {
          fetch(atts.geojson).then(response => {
            return response.json()
          }).then(json => {
            new simpleStyle(json).addTo(map)
          })
        } else {
          const el = document.querySelector(atts.geojson)
          if (el) {
            const json = JSON.parse(el.textContent)
            new simpleStyle(json).addTo(map)
          }
        }
      }
    })

    return map
  }
}
