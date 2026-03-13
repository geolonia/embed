import { isGeoloniaTilesHost } from './util';

type RequestParameters = { url: string };
type TransformAtts = { key: string; stage: string };

/** Redirect Geolonia API source requests (style JSON sources) to the sourcesUrl */
export function transformGeoloniaApiSource(
  url: string,
  sourcesUrl: URL,
): RequestParameters | null {
  if (url.startsWith('https://api.geolonia.com')) {
    return { url: sourcesUrl.toString() };
  }
  return null;
}

/** Transform geolonia:// scheme and inject key/sessionId into Geolonia tile server sources */
export function transformGeoloniaTileSource(
  url: string,
  atts: TransformAtts,
  sessionId: string,
): RequestParameters | null {
  let transformedUrl = url;

  if (url.startsWith('geolonia://')) {
    const tilesMatch = url.match(
      /^geolonia:\/\/tiles\/(?<username>.+)\/(?<customtileId>.+)/,
    );
    if (tilesMatch) {
      transformedUrl = `https://tileserver.geolonia.com/customtiles/${tilesMatch.groups.customtileId}/tiles.json`;
    }
  }

  const transformedUrlObj = new URL(transformedUrl);
  if (!isGeoloniaTilesHost(transformedUrlObj)) {
    return null;
  }

  if (atts.stage === 'dev') {
    transformedUrlObj.hostname = 'tileserver-dev.geolonia.com';
  }
  transformedUrlObj.searchParams.set('sessionId', sessionId);
  transformedUrlObj.searchParams.set('key', atts.key);
  return { url: transformedUrlObj.toString() };
}

/** Inject key and correct stage into Geolonia sprite requests */
export function transformGeoloniaSprite(
  url: string,
  atts: TransformAtts,
): RequestParameters | null {
  if (!url.match(/^https:\/\/api\.geolonia\.com\/(dev|v1)\/sprites\//)) {
    return null;
  }
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  pathParts[1] = String(atts.stage);
  urlObj.pathname = pathParts.join('/');
  urlObj.searchParams.set('key', atts.key);
  return { url: urlObj.toString() };
}
