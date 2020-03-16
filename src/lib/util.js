'use strict'

import parseApiKey from './parse-api-key'

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

export function checkPermission() {
  // It looks that isn't iFrame, so returs true.
  if (window.self === window.parent) {
    return true
  }

  const query = parseApiKey(window.document)

  // Always returs true if API key isn't 'YOUR-API-KEY'.
  if ('YOUR-API-KEY' !== query.key) {
    return true
  }

  /**
   * For the https://codepen.io/
   */
  if ('https://cdpn.io' === window.self.location.origin) {
    if (window.self !== window.parent && 'https://codepen.io/' === window.document.referrer) {
      return true
    }
  }

  /**
   * For the https://jsfiddle.net/
   */
  if ('https://fiddle.jshell.net' === window.self.location.origin) {
    if (window.self !== window.parent && 'https://jsfiddle.net/' === window.document.referrer) {
      return true
    }
  }

  /**
   * For the https://codesandbox.io/
   *
   * Note:
   * codesandbox.io has two preview window, one is in right sidebar with iframe and
   * another one is in new window.
   */
  if (window.self.location.origin.match(/csb\.app$/)) {
    if (window.self !== window.parent && window.document.referrer.match(/^https:\/\/codesandbox.io/)) {
      return true
    }
  }

  /**
   * `window.parent` will be blocked if same origin policy is activated.
   *  So, it should be catched.
   */
  try {
    if (window.self.location.origin === window.top.location.origin) {
      return true
    }
  } catch (e) {
    return false
  }

  return false
}

export function getLang() {
  const lang = (
    window.navigator.languages &&
    window.navigator.languages[0] &&
    window.navigator.languages[0].toLowerCase()
  ) || window.navigator.language.toLowerCase()

  if ('ja' === lang || 'ja-jp' === lang) {
    return 'ja'
  } else {
    return 'en'
  }
}

/**
 * Detects the window is scrollable.
 */
export function isScrollable() {
  const { height: bodyHeight } = document.body.getBoundingClientRect()
  const windowHeight = window.innerHeight

  if (bodyHeight > windowHeight) {
    return true
  } else {
    return false
  }
}

/**
 * Detects the object is HTMLElment?
 *
 * @param {*} o
 */
export function isDomElement(o) {
  return (
    typeof HTMLElement === 'object' ? o instanceof HTMLElement : // DOM2
      o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
  )
}

/**
 * Gets the HTMLElement for the map.
 * Possibility args are HTMLElement or CSS selector or object that has container property.
 *
 * @param {*} arg
 */
export function getContainer(arg) {
  if (isDomElement(arg)) {
    return arg
  } else if ('string' === typeof arg && document.querySelector(arg)) {
    return document.querySelector(arg)
  } else if (arg.container) {
    if (isDomElement(arg.container)) {
      return arg.container
    } else if (document.querySelector(arg.container)) {
      return document.querySelector(arg.container)
    }
  }

  return false
}

/**
 * Merge legacyOptions into options for geolonia.Marker class
 *
 * @param {*} options
 * @param {*} legacyOptions
 */
export function handleMarkerOptions(options, legacyOptions) {
  if (options && isDomElement(options)) {
    options = {
      element: options,
      ...legacyOptions,
    }
  } else if (!options) {
    options = legacyOptions
  }

  return options
}

export function getStyleURL(style, atts) {
  const styleUrl = isURL(style)
  if (styleUrl) {
    return styleUrl
  } else {
    if ('en' === atts.lang) {
      return `${atts.apiUrl}/styles/${style}?key=${atts.key}&lang=en`
    } else {
      return `${atts.apiUrl}/styles/${style}?key=${atts.key}`
    }
  }
}
