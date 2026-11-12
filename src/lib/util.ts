'use strict';

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
