import { test, expect } from '@playwright/test';
import { TEST_URL, waitForMapLoad } from './helper';

test.describe('Meta tag API key fallback', () => {
  test('meta タグで API キーを指定しても地図が表示されること', async ({ page }) => {
    await page.goto(`${TEST_URL}/meta-tag.html`);
    await waitForMapLoad(page);

    const mapContainer = page.locator('.geolonia');
    await expect(mapContainer).toBeVisible();

    const canvas = page.locator('.geolonia canvas');
    await expect(canvas).toBeVisible();
  });

  test('meta タグ利用時にコンソールエラーが発生しないこと', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${TEST_URL}/meta-tag.html`);
    await waitForMapLoad(page);

    expect(consoleErrors).toHaveLength(0);
  });
});
