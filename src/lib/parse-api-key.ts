import urlParse from 'url-parse';
import { Geolonia } from '../types';

function getParsedApiKey() {
  const geolonia: Geolonia = window.geolonia || {};
  if (geolonia._apiKey && geolonia._stage) {
    return {
      key: geolonia._apiKey,
      stage: geolonia._stage,
    };
  }
  return null;
}

function initApiKey(document) {
  if (typeof window.geolonia === 'undefined') {
    window.geolonia = {};
  }

  const scripts = document.currentScript ?
    [document.currentScript]
    :
    document.getElementsByTagName('script');

  const params = {
    key: 'no-api-key',
    stage: 'dev',
  };

  for (const script of scripts) {
    const { pathname, query } = urlParse(script.src);
    const q = new URLSearchParams(query.replace(/^\?/, ''));

    if (q.get('geolonia-api-key')) {
      params.key = q.get('geolonia-api-key') || 'YOUR-API-KEY';

      const res = pathname.match( /^\/(v[0-9.]+)\/embed/ );
      if (res && res[1]) {
        params.stage = res[1];
      }

      break;
    }
  }

  window.geolonia._apiKey ||= params.key;
  window.geolonia._stage ||= params.stage;

  return {
    key: window.geolonia._apiKey,
    stage: window.geolonia._stage,
  };
}

/**
 * Parses the API key and stage from the initial window.geolonia object, or from
 * the URL of the current script tag.
 *
 * This function will create `window.geolonia` if it doesn't already exist.
 * If window.geolonia._apiKey and window.geolonia._stage don't exist,
 * this function will set them to the detected values.
 * If window.geolonia._apiKey and window.geolonia._stage do exist,
 * this function will return them immediately.
 * If either window.geolonia._apiKey or window.geolonia._stage exist,
 * that value will override the detected value.
 *
 * The default values are: {key: 'no-api-key', stage: 'dev'}
 * @param {Document} document
 * @returns { key: string, stage: string }
 */
export function parseApiKey(document) {
  const apiKey = getParsedApiKey();
  if (apiKey) {
    return apiKey;
  }

  return initApiKey(document);
}
