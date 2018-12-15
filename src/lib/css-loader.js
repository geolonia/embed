import mapboxStyleText from './mapbox-gl.css'

let cssLoaded = false
const head = document.getElementsByTagName('head')[0]
const style = document.createElement('style')
style.innerText = mapboxStyleText.replace(/\n/g, '')

/**
 * load mapbox gl css once
 * @return {boolean} is substantially loaded (true) or skipped (false)
 */
export const loadCssOnce = () => {
  if (!cssLoaded) {
    cssLoaded = true
    head.appendChild(style)
    return true
  } else {
    return false
  }
}
