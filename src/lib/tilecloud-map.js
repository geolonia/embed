import mapboxgl from 'mapbox-gl'
import TilecloudControl from '@tilecloud/mbgl-tilecloud-control'
import GestureHandling from '@tilecloud/mbgl-gesture-handling'
import parseApiKey from './parse-api-key'

const getStyleURL = (styleName, userKey, stage = 'v1') => {
  return `https://api.tilecloud.io/${stage}/styles/${styleName}?key=${userKey}`
}

/**
 * Render the map
 *
 * @param container
 */
export default class TilecloudMap extends mapboxgl.Map {
  constructor(container) {
    const lat = parseFloat(container.dataset.lat) || 0
    const lng = parseFloat(container.dataset.lng) || 0
    const zoom = parseFloat(container.dataset.zoom) || 0
    const bearing = parseFloat(container.dataset.bearing) || 0
    const pitch = parseFloat(container.dataset.pitch) || 0
    const customMarker = container.dataset.customMarker || null
    const hash = ('on' === container.dataset.hash)
    const gestureHandling = ('off' !== container.dataset.gestureHandling)
    const marker = ('off' !== container.dataset.marker)
    const style = container.dataset.style || 'osm-bright'
    const key = container.dataset.key || parseApiKey(document)

    const options = {
      style: getStyleURL(style, key),
      container,
      center: [lng, lat],
      bearing: bearing,
      pitch: pitch,
      zoom: zoom,
      hash,
      localIdeographFontFamily: 'sans-serif',
      attributionControl: true,
    }

    // Getting content should be fire just before initialize the map.
    const content = container.innerHTML.trim()
    container.innerHTML = ''

    super(options)
    const map = this

    if (gestureHandling) {
      new GestureHandling().addTo(map)
    }

    map.addControl(new mapboxgl.NavigationControl())
    map.addControl(new mapboxgl.GeolocateControl())
    map.addControl(new TilecloudControl())

    map.on('load', event => {
      const map = event.target
      if (options.center && marker) {
        if (content) {
          const popup = new mapboxgl.Popup().setHTML(content)
          if (customMarker) {
            const container = document.querySelector(customMarker)
            container.style.display = 'block'
            new mapboxgl.Marker(container).setLngLat(options.center).addTo(map).setPopup(popup)
          } else {
            new mapboxgl.Marker().setLngLat(options.center).addTo(map).setPopup(popup)
          }
        } else {
          new mapboxgl.Marker().setLngLat(options.center).addTo(map)
        }
      }

      // TODO: Fires the custom event at here
    })

    return map
  }
}
