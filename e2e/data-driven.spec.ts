import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad, hasLayer } from './helper';

// embed (wrapper) 固有: data-choropleth / data-heatmap / data-circle-* を読んで
// maps-core の choropleth / heatmap / circle オプションへ渡す (embed#546)。
// 式がどう描かれるか (option → 描画) は maps-core 側 E2E (maps-core#156) が担保する。
// ここでは、属性で指定したプロパティ名と色がレイヤーの paint に届き、MapLibre が
// その式を受け付ける (error イベントもページのエラーも出ない) ことを見る。
test.describe('data-choropleth / data-heatmap / data-circle-* フォワーディング (wrapper-only)', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') pageErrors.push(message.text());
    });
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/data-driven.html`);
  });

  for (const [selector, layer, property, expected] of [
    ['#choropleth', 'geolonia-simple-style-polygon', 'fill-color', ['"value"', '#00ff00', 'rgb(0, 0, 255)']],
    ['#heatmap', 'geolonia-simple-style-heatmap', 'heatmap-weight', ['"weight"']],
    ['#heatmap', 'geolonia-simple-style-heatmap', 'heatmap-color', ['#00ff00', '#0000ff']],
    ['#circle', 'geolonia-simple-style-circle-points', 'circle-radius', ['"weight"']],
    ['#circle', 'geolonia-simple-style-circle-points', 'circle-color', ['"category"', '#00ff00', '#0000ff']],
  ] as const) {
    test(`${selector} の ${property} に属性の指定が届く`, async ({ page }) => {
      await waitForStyleLoad(page, selector);
      expect(await hasLayer(page, layer, selector)).toBe(true);

      // 届いていなければ paint の中身を返して、失敗時に何が入っていたかを見えるようにする
      await expect
        .poll(
          async () => {
            const paint = JSON.stringify(
              await page.evaluate(
                ({ sel, layer, property }) => {
                  const el = document.querySelector(sel) as any;
                  return el.geoloniaMap.getPaintProperty(layer, property);
                },
                { sel: selector, layer, property },
              ),
            );
            return expected.every((s) => paint.includes(s)) ? 'ok' : paint;
          },
          { timeout: 5000 },
        )
        .toBe('ok');

      // 不正な式は MapLibre が拒否して error イベントで報告する
      const mapErrors = await page.evaluate(
        (id) => (window as any).__mapErrors[id],
        selector.slice(1),
      );
      expect(mapErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  }
});
