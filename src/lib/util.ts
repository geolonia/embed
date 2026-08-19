'use strict';

import { keyring } from './keyring';
import type {
  GetResourceResponse,
  MapOptions,
  MarkerOptions,
  ExpiryData,
} from 'maplibre-gl';

// GetImageCallback extracted from maplibre-gl v3.6.2 ( https://github.com/maplibre/maplibre-gl-js/releases/tag/v3.6.2 )
export type GetImageCallback = (
  error?: Error | null,
  image?: HTMLImageElement | ImageBitmap | null,
  expiry?: ExpiryData | null,
) => void;

/**
 *
 * @param {string} str target URL string
 * @return {string|false} Resolved URL or false if not resolved
 */
export function isURL(str: string): string | false {
  if (str.match(/^https?:\/\//)) {
    return str;
  } else if (str.match(/^\//) || str.match(/^\.\.?/)) {
    try {
      return new URL(str, location.href).href;
    } catch (error) {
      console.error('[Geolonia]', error); // eslint-disable-line
      return false;
    }
  }

  return false;
}

export function isGeoloniaTilesHost(url: string | URL): boolean {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url;

    return (
      // NOTE: geolonia use tileserver.geolonia.com or *.tiles.geolonia.com for tile server. Other domains is NOT allowed.
      urlObj.hostname === 'tileserver.geolonia.com' ||
      urlObj.hostname.endsWith('.tiles.geolonia.com')
    );
  } catch {
    return false;
  }
}

export function checkPermission() {
  // It looks that isn't iFrame, so returns true.
  if (window.self === window.parent) {
    return true;
  }

  // Always returns true if API key is loaded.
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
    if (
      window.self !== window.parent &&
      window.document.referrer.indexOf('https://codepen.io') === 0
    ) {
      return true;
    }
  }

  /**
   * For the https://jsfiddle.net/
   */
  if (window.self.location.origin === 'https://fiddle.jshell.net') {
    if (
      window.self !== window.parent &&
      window.document.referrer.indexOf('https://jsfiddle.net') === 0
    ) {
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
    if (
      window.self !== window.parent &&
      window.document.referrer.indexOf('https://codesandbox.io') === 0
    ) {
      return true;
    }
  }

  /**
   * `window.parent` will be blocked if same origin policy is activated.
   *  So, it should be caught.
   */
  try {
    if (window.self.location.origin === window.top.location.origin) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function getLang() {
  const lang =
    (window.navigator.languages &&
      window.navigator.languages[0] &&
      window.navigator.languages[0].toLowerCase()) ||
    window.navigator.language.toLowerCase();

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

  return (
    body.scrollHeight > body.clientHeight ||
    html.scrollHeight > html.clientHeight
  );
}

/**
 * Detects the object is HTMLElement?
 *
 * @param {*} o
 */
export function isDomElement(o): o is HTMLElement {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement // DOM2
    : o &&
        typeof o === 'object' &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === 'string';
}

/**
 * Gets the HTMLElement for the map.
 * Possibility args are HTMLElement or CSS selector or object that has container property.
 *
 * @param {*} arg
 * @return {HTMLElement | false}
 */
export function getContainer(
  arg: HTMLElement | string | { container: HTMLElement | string },
): HTMLElement | false {
  if (isDomElement(arg)) {
    return arg;
  } else if (typeof arg === 'string') {
    const el =
      (document.querySelector(arg) as HTMLElement) ||
      document.getElementById(arg);
    return el || false;
  } else if (arg.container) {
    if (isDomElement(arg.container)) {
      return arg.container;
    } else if (typeof arg.container === 'string') {
      const el =
        (document.querySelector(arg.container) as HTMLElement) ||
        document.getElementById(arg.container);
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
export function handleMarkerOptions(
  options: MarkerOptions | null | undefined | false,
  legacyOptions: MarkerOptions,
) {
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
  // Geolonia スタイルを使う場合は API キー必須
  if (keyring.isGeoloniaStyleCheck(style) && !atts.key) {
    throw new Error('[Geolonia] API key is required to use Geolonia styles. Please provide an API key or use an external style URL.');
  }

  // 空の場合はデフォルト（既存挙動を維持）
  if (!style || style === '') {
    if (atts.lang === 'ja') {
      return 'https://cdn.geolonia.com/style/geolonia/basic-v2/ja.json';
    } else {
      return 'https://cdn.geolonia.com/style/geolonia/basic-v2/en.json';
    }
  }

  // URL モード: http:// or https:// で始まる、または相対パス（/、./、../）
  const styleUrl = isURL(style);
  if (styleUrl) {
    // Mixed Content の警告
    if (
      location.protocol === 'https:' &&
      styleUrl.startsWith('http:')
    ) {
      console.warn( // eslint-disable-line no-console
        `[Geolonia] Mixed Content Warning: You are loading a style from an insecure HTTP URL (${styleUrl}) on an HTTPS page. This may fail in modern browsers.`,
      );
    }
    return styleUrl;
  }

  // *.json で終わる場合も URL として扱う（相対パスの可能性）
  if (style.endsWith('.json')) {
    try {
      const absoluteUrl = new URL(style, location.href).href;
      if (
        location.protocol === 'https:' &&
        absoluteUrl.startsWith('http:')
      ) {
        console.warn( // eslint-disable-line no-console
          `[Geolonia] Mixed Content Warning: You are loading a style from an insecure HTTP URL (${absoluteUrl}) on an HTTPS page. This may fail in modern browsers.`,
        );
      }
      return absoluteUrl;
    } catch (error) {
      console.error('[Geolonia] Failed to resolve style URL:', style, error); // eslint-disable-line no-console
      // フォールバック: そのまま返す
      return style;
    }
  }

  // 従来モード: geolonia/basic などの論理名
  if (atts.lang === 'ja') {
    return `https://cdn.geolonia.com/style/${style}/ja.json`;
  } else {
    return `https://cdn.geolonia.com/style/${style}/en.json`;
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
    hash: atts.hash === 'on',
    localIdeographFontFamily: 'sans-serif',
    attributionControl: false,
  };

  if (
    atts.minZoom !== '' &&
    (Number(atts.minZoom) === 0 || Number(atts.minZoom))
  ) {
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
 * @returns { enabled: boolean, position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | void }
 */
export function parseControlOption(att) {
  const normalizedAtt = att.toLowerCase();
  if (
    ['top-right', 'bottom-right', 'bottom-left', 'top-left'].includes(
      normalizedAtt,
    )
  ) {
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
    const value = Array.from(array, (dec) =>
      dec.toString(16).padStart(2, '0'),
    ).join('');
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

/**
 * 地図の初期化に失敗したときのエラー表示。
 *
 * 既定では「WebGL が使えない状態かもしれない」という原因と、利用者が自分で試せる
 * 復旧手順を描画する。手順を書き切った版と 1 行の短縮版の両方を DOM に入れておき、
 * どちらを見せるかは地図コンテナの広さに応じて CSS（コンテナクエリ）が決める。
 * 消費側で文言を差し替えたい場合は `data-error-message` に文字列を、
 * エラー表示自体を止めたい場合は `data-error-message="off"` を指定する。
 *
 * @param container 地図コンテナ
 * @param options `message` に差し替え文言、または `'off'`（表示しない）
 */
export const handleErrorMode = (
  container: HTMLElement,
  options: { message?: string } = {},
): void => {
  const message = (options.message ?? '').trim();

  if (message.toLowerCase() === 'off') {
    return;
  }

  const errorContainer = document.createElement('div');
  errorContainer.classList.add('geolonia__error-container');

  const div = document.createElement('div');
  div.classList.add('geolonia__error-message');
  div.setAttribute('role', 'alert');

  const description = document.createElement('div');
  description.classList.add('geolonia__error-message-description');

  if (message) {
    // 消費側が指定した文言。HTML は解釈せずテキストとして描画する。
    description.textContent = message;
    div.appendChild(description);
  } else {
    const title = document.createElement('h2');
    title.classList.add('geolonia__error-message-title');
    title.textContent = '地図を表示できませんでした';
    div.appendChild(title);

    const lead = document.createElement('p');
    lead.classList.add('geolonia__error-message-lead');
    lead.textContent =
      'お使いの環境で地図の描画機能（WebGL）が利用できない状態になっている可能性があります。次の順にお試しください。';
    description.appendChild(lead);

    const steps = document.createElement('ol');
    steps.classList.add('geolonia__error-message-steps');
    for (const step of [
      'ブラウザをすべて閉じて、開き直す',
      'パソコンやスマートフォンを再起動する',
      '別のブラウザで開く',
      'パソコンの場合は、グラフィックドライバを更新する',
    ]) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    }
    description.appendChild(steps);

    const contact = document.createElement('p');
    contact.classList.add('geolonia__error-message-contact');
    contact.textContent =
      '解決しない場合は、このサイトの窓口までご連絡ください。';
    description.appendChild(contact);

    // 手順を書き切れない狭いコンテナ向け。表示の切り替えは CSS が行う。
    const brief = document.createElement('p');
    brief.classList.add('geolonia__error-message-brief');
    brief.textContent =
      'ブラウザや端末を再起動すると解消する場合があります。';
    description.appendChild(brief);

    div.appendChild(description);
  }

  errorContainer.appendChild(div);
  container.appendChild(errorContainer);
};

export const sanitizeDescription = async (description) => {
  const { default: sanitizeHtml } = await import('sanitize-html');
  return sanitizeHtml(description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class'],
    },
  });
};

export const random = (max: number): number => Math.floor(Math.random() * max);

// This function is used to provide backward compatibility with callback invocations,
// so we ignore ESLint rules for this function.
// Note: this cannot be a generic promiseToCallback function because the callback is not
// the traditional (error, result) style callback.
export function loadImageCompatibility(
  promise: Promise<GetResourceResponse<HTMLImageElement | ImageBitmap>>,
  callback: GetImageCallback,
): void {
  promise
    // eslint-disable-next-line promise/prefer-await-to-then
    .then((response) => {
      // eslint-disable-next-line promise/no-callback-in-promise
      callback(null, response.data, {
        cacheControl: response.cacheControl,
        expires: response.expires,
      });
      return;
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch((error) => {
      // eslint-disable-next-line promise/no-callback-in-promise
      callback(error);
    });
}
