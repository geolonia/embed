import { Page } from '@playwright/test';

export const TEST_URL = 'http://localhost:3000/e2e';
export const LOAD_TIMEOUT = 5000;

/** 地図コンテナと canvas の出現を待つ。既存テスト互換。 */
export async function waitForMapLoad(page: Page, selector = '.geolonia') {
  await page.waitForSelector(selector);
  await page.waitForSelector(`${selector} canvas`, { timeout: LOAD_TIMEOUT });
}

/** Maplibre Map の load + isStyleLoaded を待つ。スタイル依存テスト向け。 */
export async function waitForStyleLoad(page: Page, selector = '#map') {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel) as any;
      return !!(el && el.geoloniaMap && el.geoloniaMap.loaded() && el.geoloniaMap.isStyleLoaded());
    },
    selector,
    { timeout: LOAD_TIMEOUT },
  );
}

/** container.geoloniaMap が生成済みか確認。 */
export async function hasMapInstance(page: Page, selector = '#map'): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    return !!(el && el.geoloniaMap);
  }, selector);
}

export async function getCenter(page: Page, selector = '#map'): Promise<{ lat: number; lng: number }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    const c = el.geoloniaMap.getCenter();
    return { lat: c.lat, lng: c.lng };
  }, selector);
}

export async function getZoom(page: Page, selector = '#map'): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    return el.geoloniaMap.getZoom();
  }, selector);
}

export async function getBearing(page: Page, selector = '#map'): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    return el.geoloniaMap.getBearing();
  }, selector);
}

export async function getPitch(page: Page, selector = '#map'): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    return el.geoloniaMap.getPitch();
  }, selector);
}

export async function getStyleLayerIds(page: Page, selector = '#map'): Promise<string[]> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as any;
    return el.geoloniaMap.getStyle().layers.map((l: any) => l.id);
  }, selector);
}

export async function hasLayer(page: Page, layerId: string, selector = '#map'): Promise<boolean> {
  return page.evaluate(
    ({ sel, id }) => {
      const el = document.querySelector(sel) as any;
      return !!el.geoloniaMap.getLayer(id);
    },
    { sel: selector, id: layerId },
  );
}

export async function hasSource(page: Page, sourceId: string, selector = '#map'): Promise<boolean> {
  return page.evaluate(
    ({ sel, id }) => {
      const el = document.querySelector(sel) as any;
      return !!el.geoloniaMap.getSource(id);
    },
    { sel: selector, id: sourceId },
  );
}

// Geolonia ベクトルタイルのホスト。TileJSON で返す URL とリクエスト捕捉用 regex の両方が
// この定数から派生するので、両者が乖離することは構造上ありえない。
const GEOLONIA_TILE_HOST = 'tiles.geolonia.com';
const GEOLONIA_TILE_URL_TEMPLATE = `https://${GEOLONIA_TILE_HOST}/{z}/{x}/{y}.pbf`;
// サブドメイン付き (`osm.v3.tiles.geolonia.com` 等) もサブドメイン無しも同一 regex で捕捉。
const GEOLONIA_TILE_PBF_REGEX = new RegExp(
  String.raw`(?:[^/]+\.)?` + GEOLONIA_TILE_HOST.replace(/\./g, String.raw`\.`) + String.raw`\/.*\.pbf`,
);

/**
 * Geolonia のスタイル/タイル/スプライト等を最小レスポンスでモックする。
 * テスト先頭の beforeEach で呼ぶ前提。
 *
 * 返すスタイルは maps-core の sample-basic-style.json (PR #81) に揃えた
 * minimal style v8。具体的には:
 * - `glyphs` フィールド (symbol layer が silently skip されないため必須)
 * - dummy `fixture` source + attribution (attribution テストで集計対象を作る)
 * - background + fixture fill レイヤ
 *
 * 認証URL検証など transformRequest の挙動は実リクエスト前にここで握る。
 */
export async function mockGeoloniaTiles(page: Page) {
  // スタイル JSON (cdn.geolonia.com/style/...)
  await page.route(/cdn\.geolonia\.com\/style\/.+\.json/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        version: 8,
        glyphs: '/glyphs/{fontstack}/{range}.pbf',
        sources: {
          fixture: {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            attribution: '<a href="https://example.com">Test fixture</a>',
          },
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#cccccc' } },
          { id: 'fixture', type: 'fill', source: 'fixture', paint: { 'fill-color': '#cccccc' } },
        ],
      }),
    }),
  );

  // スプライト / グリフ / フォント関連は 404 でよい (実体は不要だが minimal style 内の
  // glyphs path に対するリクエストが net error にならないよう route で握る)
  await page.route(/cdn\.geolonia\.com\/(sprite|glyph|font)/, (route) =>
    route.fulfill({ status: 404, body: '' }),
  );

  // TileJSON
  await page.route(/tileserver\.geolonia\.com\/.*/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tilejson: '2.2.0',
        tiles: [GEOLONIA_TILE_URL_TEMPLATE],
        minzoom: 0,
        maxzoom: 14,
      }),
    }),
  );

  // ベクトルタイル (上記 TileJSON が返した URL を必ず捕捉)
  await page.route(GEOLONIA_TILE_PBF_REGEX, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );

  // api.geolonia.com (legacy / permission check 等)
  await page.route(/api\.geolonia\.com\/.*/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

/**
 * 指定 predicate にマッチしたリクエスト URL を記録する。
 * 呼び出し時点で配列を返し、以降の page 操作中に push される。
 * 認証パラメータ注入の検証などに使用。
 */
export function recordRequests(
  page: Page,
  predicate: (url: string) => boolean = () => true,
): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    if (predicate(req.url())) urls.push(req.url());
  });
  return urls;
}
