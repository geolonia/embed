'use strict';

import { keyring } from './keyring';
import type { MapOptions, MarkerOptions } from 'maplibre-gl';

/**
 *
 * @param {string} str target URL string
 * @return {string|false} Resolved URL or false if not resolved
 */
export function isURL(str) {
  if (str.match(/^https?:\/\//)) {
    return str;
  } else if (str.match(/^\//) || str.match(/^\.\.?/)) {
    try {
      return new URL(str, location.href).href;
    } catch (error) {
      console.error('[Geolonia]', error) // eslint-disable-line
      return false;
    }
  }

  return false;
}

export function checkPermission() {
  // It looks that isn't iFrame, so returs true.
  if (window.self === window.parent) {
    return true;
  }

  // Always returs true if API key is loaded.
  if (keyring.apiKey) {
    return true;
  }

  /**
   * For the https://codepen.io/
   * iFrame による Codepen の地図の認可外のサイトへの埋め込みを許可しない
   */
  if (
    window.self.location.origin === 'https://cdpn.io' ||
    window.self.location.origin === 'https://codepen.io'
  ) {
    if (window.self !== window.parent && window.document.referrer.indexOf('https://codepen.io') === 0) {
      return true;
    }
  }

  /**
   * For the https://jsfiddle.net/
   */
  if (window.self.location.origin === 'https://fiddle.jshell.net') {
    if (window.self !== window.parent && window.document.referrer.indexOf('https://jsfiddle.net') === 0) {
      return true;
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
    if (window.self !== window.parent && window.document.referrer.indexOf('https://codesandbox.io') === 0) {
      return true;
    }
  }

  /**
   * `window.parent` will be blocked if same origin policy is activated.
   *  So, it should be catched.
   */
  try {
    if (window.self.location.origin === window.top.location.origin) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}

export function getLang() {
  const lang = (
    window.navigator.languages &&
    window.navigator.languages[0] &&
    window.navigator.languages[0].toLowerCase()
  ) || window.navigator.language.toLowerCase();

  if (lang === 'ja' || lang === 'ja-jp') {
    return 'ja';
  } else {
    return 'en';
  }
}

/**
 * Detects the window is scrollable.
 */
export function isScrollable() {
  const body = document.body;
  const html = document.documentElement;

  return body.scrollHeight > body.clientHeight || html.scrollHeight > html.clientHeight;
}

/**
 * Detects the object is HTMLElment?
 *
 * @param {*} o
 */
export function isDomElement(o): o is HTMLElement {
  return (
    typeof HTMLElement === 'object' ? o instanceof HTMLElement : // DOM2
      o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
  );
}

/**
 * Gets the HTMLElement for the map.
 * Possibility args are HTMLElement or CSS selector or object that has container property.
 *
 * @param {*} arg
 * @return {HTMLElement | false}
 */
export function getContainer(arg: HTMLElement | string | { container: HTMLElement | string; }): HTMLElement | false {
  if (isDomElement(arg)) {
    return arg;
  } else if (typeof arg === 'string') {
    const el = document.querySelector(arg) as HTMLElement || document.getElementById(arg);
    return el || false;

  } else if (arg.container) {
    if (isDomElement(arg.container)) {
      return arg.container;
    } else if (typeof arg.container === 'string') {
      const el = document.querySelector(arg.container) as HTMLElement || document.getElementById(arg.container);
      return el || false;
    }
  }

  return false;
}

/**
 * Merge legacyOptions into options for geolonia.Marker class
 *
 * @param {*} options
 * @param {*} legacyOptions
 */
export function handleMarkerOptions(options: MarkerOptions | null | undefined | false, legacyOptions: MarkerOptions) {
  if (options && isDomElement(options)) {
    options = {
      element: options as HTMLElement,
      ...legacyOptions,
    };
  } else if (!options) {
    options = legacyOptions;
  }

  return options;
}

export function getStyle(style, atts) {
  const styleUrl = isURL(style);
  if (styleUrl) {
    return styleUrl;
  } else {
    if (atts.lang === 'ja') {
      return `https://cdn.geolonia.com/style/${style}/ja.json`;
    } else {
      return `https://cdn.geolonia.com/style/${style}/en.json`;
    }
  }
}

// params are the parameters that have been passed to new geolonia.Map(params)
// atts are the data-XYZ attributes that are on the container
export function getOptions(container, params, atts): MapOptions {
  if (params.container) {
    delete params.container; // Don't overwrite container.
  }

  if (params === container) {
    params = {}; // `params` is HTMLElement, so we shouldn't merge it into options.
  }

  const options: MapOptions = {
    style: atts.style || params.style, // Validation for value of `style` will be processed on `setStyle()`.
    container,
    center: [parseFloat(atts.lng), parseFloat(atts.lat)],
    bearing: parseFloat(atts.bearing),
    pitch: parseFloat(atts.pitch),
    zoom: parseFloat(atts.zoom),
    hash: (atts.hash === 'on'),
    localIdeographFontFamily: 'sans-serif',
    attributionControl: false,
  };

  if (atts.minZoom !== '' && (Number(atts.minZoom) === 0 || Number(atts.minZoom))) {
    options.minZoom = Number(atts.minZoom);
  }

  if (atts.maxZoom !== '' && Number(atts.maxZoom)) {
    options.maxZoom = Number(atts.maxZoom);
  }

  Object.assign(options, params);

  return options;
}

/**
 *
 * @param {string} an data-*-control Embed attribute
 * @returns { enabled: bolean, position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | void }
 */
export function parseControlOption(att) {
  const normalizedAtt = att.toLowerCase();
  if (['top-right', 'bottom-right', 'bottom-left', 'top-left'].includes(normalizedAtt)) {
    return { enabled: true, position: normalizedAtt };
  } else if (['on', 'off'].includes(normalizedAtt)) {
    return { enabled: normalizedAtt === 'on', position: void 0 };
  } else {
    return { enabled: false, position: void 0 };
  }
}

/**
 * keep session
 */
let sessionId = '';

/**
 *
 * @param {number} digits for session
 * @returns sessionId
 */
export const getSessionId = (digit) => {
  if (sessionId) {
    return sessionId;
  } else {
    const array = new Uint8Array(digit / 2);
    window.crypto.getRandomValues(array);
    const value = Array
      .from(array, (dec) => dec.toString(16).padStart(2, '0'))
      .join('');
    sessionId = value;
    return value;
  }
};

export const parseSimpleVector = (attributeValue) => {
  if (/^(https?|geolonia):\/\//.test(attributeValue)) {
    return attributeValue;
  } else {
    return `geolonia://tiles/custom/${attributeValue}`;
  }
};

export const handleRestrictedMode = (map) => {
  if (!map._geolonia_restricted_mode_handled) {
    map._geolonia_restricted_mode_handled = true;
    const container = map.getContainer();
    map.remove();
    container.innerHTML = '';
    container.classList.add('geolonia__restricted-mode-image-container');
  }
};

export const sanitizeDescription = async (description) => {
  const { default: sanitizeHtml } = await import('sanitize-html');
  return sanitizeHtml(description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
    allowedAttributes: {...sanitizeHtml.defaults.allowedAttributes, '*': ['class']},
  });
};

export const random = (max: number): number => Math.floor(Math.random() * max);
