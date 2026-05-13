/**
 * PR0 sanity-check: helper.ts のヘルパー群が機能していることを確認する最小テスト。
 * 後続フェーズで具体的なテストが充実したら削除してよい。
 */
import { test, expect } from '@playwright/test';
import {
  TEST_URL,
  mockGeoloniaTiles,
  waitForStyleLoad,
  hasMapInstance,
  getStyleLayerIds,
  recordRequests,
} from './helper';

test.describe('PR0 helper sanity', () => {
  test('mockGeoloniaTiles を適用すると minimal style だけが読み込まれる', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/nocontrol.html`);
    await waitForStyleLoad(page);

    expect(await hasMapInstance(page)).toBe(true);
    const layers = await getStyleLayerIds(page);
    expect(layers).toEqual(['background']);
  });

  test('recordRequests で geolonia 系へのリクエストを観測できる', async ({ page }) => {
    await mockGeoloniaTiles(page);
    const styleRequests = recordRequests(page, (url) => url.includes('cdn.geolonia.com/style/'));
    await page.goto(`${TEST_URL}/nocontrol.html`);
    await waitForStyleLoad(page);

    expect(styleRequests.length).toBeGreaterThan(0);
    expect(styleRequests[0]).toMatch(/cdn\.geolonia\.com\/style\/.+\.json/);
  });
});
