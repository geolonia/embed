import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad, hasLayer, hasSource } from './helper';

// embed (wrapper) 固有: data-mask と data-mask-* を読んで maps-core の mask オプションへ渡す (embed#572)。
// 境界をどうくり抜いて描くかは maps-core 側のテスト (maps-core#171) が担保する。
// ここでは、属性の値がマスクのレイヤに届き、MapLibre のエラーもページのエラーも出ないことを見る。

const AREA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[139.0, 35.0], [139.2, 35.0], [139.2, 35.1], [139.0, 35.1], [139.0, 35.0]]],
      },
    },
  ],
};

test.describe('data-mask-* フォワーディング (wrapper-only)', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });
    await mockGeoloniaTiles(page);
    await page.route(/mask\.example\.com\//, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/geo+json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(AREA),
      }),
    );
    await page.goto(`${TEST_URL}/mask.html`);
  });

  test('data-mask-* の指定がマスクと境界線のレイヤに届く', async ({ page }) => {
    await waitForStyleLoad(page, '#mask');
    await expect.poll(() => hasSource(page, 'geolonia-mask', '#mask')).toBe(true);
    expect(await hasLayer(page, 'geolonia-mask', '#mask')).toBe(true);
    expect(await hasLayer(page, 'geolonia-mask-outline', '#mask')).toBe(true);

    const paint = await page.evaluate(() => {
      const map = (document.querySelector('#mask') as any).geoloniaMap;
      return {
        fillColor: map.getPaintProperty('geolonia-mask', 'fill-color'),
        fillOpacity: map.getPaintProperty('geolonia-mask', 'fill-opacity'),
        lineColor: map.getPaintProperty('geolonia-mask-outline', 'line-color'),
      };
    });
    expect(paint).toEqual({ fillColor: '#123456', fillOpacity: 0.5, lineColor: '#123456' });

    // 境界の GeoJSON を取得して、範囲をくり抜いた面（MultiPolygon の Feature）がソースに入る
    await expect
      .poll(() =>
        page.evaluate(() => {
          const map = (document.querySelector('#mask') as any).geoloniaMap;
          return map
            .getSource('geolonia-mask')
            .getData()
            .then((data: any) => data.geometry?.type ?? null);
        }),
      )
      .toBe('MultiPolygon');

    expect(await page.evaluate(() => (window as any).__mapErrors.mask)).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
