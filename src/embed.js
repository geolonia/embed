/**
 * @file Entry for tilecloud.js
 */

import '@babel/polyfill'
import './configure'
import parseApiKey from './lib/parse-api-key'
import preRender from './lib/pre-render'
import { URL_BASE, DEFAULT_MAP_STYLE_NAME } from './constants'

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
      const styleName = container.dataset.style || DEFAULT_MAP_STYLE_NAME
      const userKey = parseApiKey(document)
      return { container, styleName, userKey }
    })

    const styles = await Promise.all(
      maps.map(({ styleName, userKey }) => {
        return (
          fetch(getStyleURL(styleName, userKey))
            .then(res => {
              if (!res.ok) {
                throw new Error('unknown style')
              }
              return res.json()
            })
            // fallback
            .catch(() =>
              fetch(getStyleURL(DEFAULT_MAP_STYLE_NAME, userKey)).then(res =>
                res.json(),
              ),
            )
            .then(style => ({ [styleName]: style }))
        )
      }),
    ).then(styles => styles.reduce((prev, style) => ({ ...prev, ...style })))

    maps = maps.map(({ container, styleName }) => ({
      container,
      style: styles[styleName],
    }))

    return await preRender(maps)
  }
}

// GO!
main()
