import parseApiKey from './lib/parse-api-key'
import preRender from './lib/pre-render'
import { MAP_TYPES, STYLE_URL } from './configure'

const basicMapContainers = Array.prototype.slice.call(
  document.getElementsByClassName(MAP_TYPES.BASIC),
)

const API_KEY = parseApiKey()

// provide unique ids
basicMapContainers.forEach((element, i) => {
  if (!element.id) {
    element.id = `__${MAP_TYPES.BASIC}_${i}`
  }
})

const styleUrl = STYLE_URL[MAP_TYPES.BASIC]

// GO!
preRender(basicMapContainers, styleUrl, API_KEY)
