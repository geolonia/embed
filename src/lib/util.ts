'use strict';

import { keyring } from '@geolonia/maps-core';

/**
 * Parse the Geolonia API key from the `?geolonia-api-key=` query of the
 * embed `<script>` tag (backward compatibility).
 *
 * maps-core's keyring no longer scans the DOM, so this embed-specific
 * helper reads the script tag and returns the key/stage for the caller to
 * push into the keyring via `setApiKey()` / `setStage()`.
 *
 * @param doc Document to scan (defaults to the global `document`)
 * @returns `{ apiKey, stage }` when found, otherwise `null`
 */
export function parseScriptTagApiKey(
  doc: Document = document,
): { apiKey: string; stage: string } | null {
  const scripts: HTMLScriptElement[] | HTMLCollectionOf<HTMLScriptElement> =
    doc.currentScript
      ? [doc.currentScript as HTMLScriptElement]
      : doc.getElementsByTagName('script');

  for (const script of scripts) {
    const src = script.src;
    if (!src) {
      continue;
    }
    // Resolve against a base URI so protocol-relative (`//cdn/...`) and
    // relative script srcs don't throw `TypeError: Invalid URL`.
    const url = new URL(src, doc.baseURI || window.location.href);
    const apiKey = url.searchParams.get('geolonia-api-key');

    if (apiKey) {
      return {
        apiKey,
        stage: process.env.MAP_PLATFORM_STAGE || 'dev',
      };
    }
  }

  return null;
}

/**
 * Detect whether the embed is allowed to render in the current (possibly
 * iframed) context. Embed-specific: not provided by maps-core.
 */
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
    if (window.self.location.origin === window.top?.location.origin) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
