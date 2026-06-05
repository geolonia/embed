import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad, hasMapInstance } from './helper';

// embed (wrapper) 固有: script タグを読むだけで .geolonia 要素が自動描画される
// (renderGeoloniaMap の DOM 走査)。maps-core は new GeoloniaMap() の明示呼び出しのみで
// この自動走査を持たない。
test.describe('DOM 自動走査 / auto-render (wrapper-only)', () => {
  test('複数の .geolonia 要素が独立に描画される', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/multiple-maps.html`);

    await waitForStyleLoad(page, '#map-a');
    await waitForStyleLoad(page, '#map-b');
    await waitForStyleLoad(page, '#map-c');

    const result = await page.evaluate(() =>
      ['#map-a', '#map-b', '#map-c'].map((sel) => {
        const el = document.querySelector(sel) as any;
        return !!el?.geoloniaMap;
      }),
    );
    expect(result).toEqual([true, true, true]);
  });

  test('DOMContentLoaded 後に追加された .geolonia は自動 render されない (one-shot)', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/multiple-maps.html`);
    await waitForStyleLoad(page, '#map-a');

    // 後から .geolonia を追加 (即時描画されるはずの data-lazy-loading="off" 指定)
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.id = 'late-map';
      el.className = 'geolonia';
      el.setAttribute('data-lazy-loading', 'off');
      el.setAttribute('style', 'width:400px;height:250px;');
      document.body.appendChild(el);
    });
    await page.waitForTimeout(500);

    // renderGeoloniaMap は読込時に一度だけ走査するため拾われない
    expect(await hasMapInstance(page, '#late-map')).toBe(false);
  });
});
