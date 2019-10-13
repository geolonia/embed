'use strict'

export function isURL(str) {
  if (str.match(/^https?:\/\//)) {
    return true
  } else if (str.match(/^\//)) {
    return true
  } else if (str.match(/^\.\.?/)) {
    return true
  }

  return false
}
