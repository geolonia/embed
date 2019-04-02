/**
 * @file Entry for tilecloud.js
 */

import '@babel/polyfill'
import './configure'
import parseApiKey from './lib/parse-api-key'
import preRender from './lib/pre-render'
import { URL_BASE } from './constants'

const getStyleURL = (styleName, userKey, stage = 'v1') =>
  `${URL_BASE}/${stage}/styles/${styleName}?key=${userKey}`

const basicMapContainers = Array.prototype.slice.call(
  document.getElementsByClassName('tilecloud') || [],
)

const main = async () => {
  if (basicMapContainers.length > 0) {
    // provide unique ids
    let maps = basicMapContainers.map((container, i) => {
      if (!container.id) {
        container.id = `__tilecloud_${i}`
      }
      const styleName = container.dataset.style
      const userKey = parseApiKey(document)
      return { container, styleName, userKey }
    })

    const styles = await Promise.all(
      maps.map(({ styleName, userKey }) => {
        console.log('a')
        return fetch(getStyleURL(styleName, userKey))
          .then(res => res.json())
          .then(style => ({ [styleName]: style }))
      }),
    ).then(styles => styles.reduce((prev, style) => ({ ...prev, ...style })))

    console.log(styles)

    maps = maps.map(({ container, styleName }) => ({
      container,
      style: styles[styleName],
    }))

    return await preRender(maps)
  }
}

// GO!
main()
