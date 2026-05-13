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

/**
 * Geolonia のスタイル/タイル/スプライト等を最小レスポンスでモックする。
 * テスト先頭の beforeEach で呼ぶ前提。
 *
 * 返すスタイルは layers=[background] のみのミニマル style v8。
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
        sources: {},
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#cccccc' } },
        ],
      }),
    }),
  );

  // スプライト / グリフ / フォント関連は 404 でよい (background のみなので参照されない)
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
        tiles: ['https://tiles.geolonia.com/{z}/{x}/{y}.pbf'],
        minzoom: 0,
        maxzoom: 14,
      }),
    }),
  );

  // ベクトルタイル
  await page.route(/\.tiles\.geolonia\.com\/.*\.pbf/, (route) =>
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
