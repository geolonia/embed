'use strict'

/**
 *
 * @param {string} str target URL string
 * @return {string|false} Resolved URL or false if not resolved
 */
export function isURL(str) {
  if (str.match(/^https?:\/\//)) {
    return str
  } else if (str.match(/^\//) || str.match(/^\.\.?/)) {
    try {
      return new URL(str, location.href).href
    } catch (error) {
      console.error(error) // eslint-disable-line
      return false
    }
  }

  return false
}
