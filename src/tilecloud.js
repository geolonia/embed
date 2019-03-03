/**
 * @file Entry for tilecloud.js
 */

import '@babel/polyfill'
import parseApiKey from './lib/parse-api-key'
import preRender from './lib/pre-render'
import { MAP_TYPES, generateStyles } from './configure'

const basicMapContainers = Array.prototype.slice.call(
  document.getElementsByClassName(MAP_TYPES.BASIC) || [],
)

if (basicMapContainers.length > 0) {
  // provide unique ids
  basicMapContainers.forEach((element, i) => {
    if (!element.id) {
      element.id = `__${MAP_TYPES.BASIC}_${i}`
    }
  })

  const API_KEY = parseApiKey(document)
  const style = generateStyles[MAP_TYPES.BASIC](API_KEY)

  // GO!
  preRender(basicMapContainers, style)
}
