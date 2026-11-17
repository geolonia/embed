import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad, hasLayer, hasSource } from './helper';

// embed (wrapper) 固有: data-projection と data-raster-tiles-* を読んで maps-core の
// projection / rasterTiles オプションへ渡す (embed#577、embed#578)。
// オプションがどう描かれるかは maps-core 側のテスト (maps-core#180、maps-core#182) が担保する。
// ここでは、属性の値がオプションとして届き、MapLibre のエラーもページのエラーも出ないことを見る。

// 1x1 の透明な PNG
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('data-projection / data-raster-tiles-* フォワーディング (wrapper-only)', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });
    await mockGeoloniaTiles(page);
    await page.route(/raster-tiles\.example\.com\//, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 }),
    );
    await page.goto(`${TEST_URL}/projection-raster-tiles.html`);
  });

  const mapErrorsOf = (page: import('@playwright/test').Page, id: string) =>
    page.evaluate((id) => (window as any).__mapErrors[id], id);

  test('data-projection="globe" で投影が globe になる', async ({ page }) => {
    await waitForStyleLoad(page, '#globe');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const el = document.querySelector('#globe') as any;
          return el.geoloniaMap.getProjection()?.type;
        }),
      )
      .toBe('globe');
    expect(await mapErrorsOf(page, 'globe')).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('data-raster-tiles-* の指定がソースとレイヤに届く', async ({ page }) => {
    await waitForStyleLoad(page, '#raster');
    await expect.poll(() => hasSource(page, 'geolonia-raster-tiles', '#raster')).toBe(true);
    expect(await hasLayer(page, 'geolonia-raster-tiles', '#raster')).toBe(true);

    const { source, opacity } = await page.evaluate(() => {
      const map = (document.querySelector('#raster') as any).geoloniaMap;
      return {
        source: map.getStyle().sources['geolonia-raster-tiles'],
        opacity: map.getPaintProperty('geolonia-raster-tiles', 'raster-opacity'),
      };
    });
    expect(source).toMatchObject({
      type: 'raster',
      tiles: ['https://raster-tiles.example.com/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 12,
      attribution: 'Raster fixture',
    });
    expect(opacity).toBe(0.5);
    expect(await mapErrorsOf(page, 'raster')).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
