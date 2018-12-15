/**
 * fetch mapbox style json
 * @param  {string|object} style style object or URL
 * @return {Promise}             resolved style object
 */
export const fetchStyle = style => {
  if (typeof style === 'string') {
    const styleURL = style
    return fetch(styleURL).then(res => {
      if (res.ok) {
        return res.json()
      } else {
        return new Error(res.text())
      }
    })
  } else {
    return new Promise(resolve => resolve(style))
  }
}
