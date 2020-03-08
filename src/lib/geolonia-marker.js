'use strict'

import mapboxgl from 'mapbox-gl'
import tinycolor from 'tinycolor2'
import markerSVG from 'svg-inline-loader!./marker.svg'
import * as util from './util'

/**
 * Render the map
 *
 * @param container
 */
export default class GeoloniaMarker extends mapboxgl.Marker {
  constructor(options, legacyOptions = {}) {
    if (options && util.isDomElement(options)) {
      options = {
        element: options,
        ...legacyOptions,
      }
    } else if (!options) {
      options = {}
    }

    if (!options.element) {
      const markerElement = document.createElement('div')
      markerElement.className = 'geolonia-default-marker'
      markerElement.innerHTML = markerSVG

      // The dimention of marker.svg is 52:67.
      markerElement.style.margin = 0
      markerElement.style.padding = 0
      markerElement.style.width = '25.5px'
      markerElement.style.height = '34.5px'

      const markerObj = markerElement.querySelector('svg')
      markerObj.style.width = '100%'
      markerObj.style.height = '100%'

      options.element = markerElement

      if (options.color) {
        const color = tinycolor(options.color).darken().toString()
        markerElement.querySelector('.left').style.fill = options.color
        markerElement.querySelector('.right').style.fill = color
      } else {
        markerElement.querySelector('.left').style.fill = '#EE730F'
        markerElement.querySelector('.right').style.fill = '#E84130'
      }

      options.offset = [0, -17.25]
    }

    super(options)
    const marker = this

    return marker
  }
}
