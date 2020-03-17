'use strict'

import mapboxgl from 'mapbox-gl'
import tinycolor from 'tinycolor2'
import markerSVG from './marker.svg'
import * as util from './util'

/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMarker extends mapboxgl.Marker {
  constructor(options = {}, legacyOptions = {}) {
    options = util.handleMarkerOptions(options, legacyOptions)

    if (!options || !options.element) {
      const markerElement = document.createElement('div')
      markerElement.className = 'geolonia-default-marker'
      markerElement.innerHTML = markerSVG

      // Following shoud follow the dimention of marker.svg 52:67.
      markerElement.style.margin = 0
      markerElement.style.padding = 0
      markerElement.style.width = '26px'
      markerElement.style.height = '34px'

      const markerObj = markerElement.querySelector('svg')
      markerObj.style.width = '100%'
      markerObj.style.height = '100%'

      options.element = markerElement

      if (options.color) {
        markerElement.querySelector('.left').style.fill = options.color
        markerElement.querySelector('.right').style.fill = tinycolor(options.color).darken().toString()
      } else {
        const defaultColor = '#E4402F'
        markerElement.querySelector('.left').style.fill = defaultColor
        markerElement.querySelector('.right').style.fill = tinycolor(defaultColor).darken().toString()
      }

      options.offset = [0, -15]
    }

    super(options)
    const marker = this

    return marker
  }
}
