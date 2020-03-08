import mapboxgl from 'mapbox-gl'
import markerSVG from 'svg-inline-loader!./marker.svg'


/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMarker extends mapboxgl.Marker {
  constructor(options, legacyOptions) {
    if (!options || !options.element) {
      const markerElement = document.createElement('div')
      markerElement.className = 'geolonia-default-marker'
      markerElement.innerHTML = markerSVG

      // The dimention of marker.svg is 52:67.
      markerElement.style.margin = 0
      markerElement.style.padding = 0
      markerElement.style.width = '26px'
      markerElement.style.height = '33.5px'

      const markerObj = markerElement.querySelector('svg')
      markerObj.style.width = '100%'
      markerObj.style.height = '100%'

      if (! options) {
        options = {
          element: markerElement
        }
      } else {
        options.element = markerElement
      }
    }

    super(options, legacyOptions)
    const marker = this

    return marker
  }
}
