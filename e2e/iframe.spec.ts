import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_URL, mockGeoloniaTiles, waitForMapLoad, hasMapInstance } from './helper';

// 子フレーム用の別オリジン。リクエストは route で dev サーバーへ転送する
const OTHER_ORIGIN = 'http://embed-iframe.test';

// embed (wrapper) 固有: class="geolonia" の要素は、iframe の中でも API キーの有無に関係なく地図になる。
test.describe('iframe の中での描画 (wrapper-only)', () => {
  test('非 iframe で地図が描画される', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);

    expect(await hasMapInstance(page, '#map')).toBe(true);
  });

  test('API キー無しの embed を別オリジンの iframe に入れても地図が描画される', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await mockGeoloniaTiles(page);
    await page.route(`${OTHER_ORIGIN}/**`, async (route) => {
      const url = route.request().url().replace(OTHER_ORIGIN, BASE_URL);
      route.fulfill({ response: await route.fetch({ url }) });
    });
    await page.goto(`${TEST_URL}/iframe.html?origin=${encodeURIComponent(OTHER_ORIGIN)}`);

    const frame = page.frameLocator('#frame');
    await expect(frame.locator('#map canvas')).toBeVisible({ timeout: 10000 });

    const child = page.frames().find((f) => f.url().endsWith('/e2e/no-api-key.html'));
    expect(child).toBeDefined();
    expect(new URL(child!.url()).origin).toBe(OTHER_ORIGIN);
    expect(
      await child!.evaluate(() => !!(document.querySelector('#map') as any)?.geoloniaMap),
    ).toBe(true);
    expect(consoleErrors.some((t) => t.includes("can't display our map in iframe"))).toBe(false);
  });
});
