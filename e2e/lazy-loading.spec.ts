import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad, hasMapInstance } from './helper';

// embed (wrapper) 固有: IntersectionObserver による遅延読み込み。
// maps-core は new GeoloniaMap() の明示初期化のみで、この lazy 機構を持たない。
test.describe('遅延読み込み / IntersectionObserver (wrapper-only)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGeoloniaTiles(page);
  });

  test('data-lazy-loading="off" は viewport 外でも即時初期化される', async ({ page }) => {
    await page.goto(`${TEST_URL}/lazy-loading.html`);
    // スクロールせずとも初期化済み
    await waitForStyleLoad(page, '#eager-map');
    expect(await hasMapInstance(page, '#eager-map')).toBe(true);
  });

  test('デフォルト (lazy) は viewport 外では未初期化、スクロールで初期化される', async ({ page }) => {
    await page.goto(`${TEST_URL}/lazy-loading.html`);

    // スクロール前: lazy-map はまだ初期化されていない
    // (IntersectionObserver の callback は非同期なので、誤発火しないことも含め少し待つ)
    await page.waitForTimeout(300);
    expect(await hasMapInstance(page, '#lazy-map')).toBe(false);

    // viewport に入れる
    await page.locator('#lazy-map').scrollIntoViewIfNeeded();
    await waitForStyleLoad(page, '#lazy-map');

    expect(await hasMapInstance(page, '#lazy-map')).toBe(true);
  });
});
