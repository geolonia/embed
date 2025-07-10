import { test, expect, Page } from '@playwright/test';

// テスト用の設定
const TEST_URL = 'http://localhost:3000/e2e';
const LOAD_TIMEOUT = 5000;

// ヘルパー関数
async function waitForMapLoad(page: Page, selector = '.geolonia') {
  // 地図コンテナの存在を確認
  await page.waitForSelector(selector);
  // Maplibreのcanvasが表示されるまで待機
  await page.waitForSelector(`${selector} canvas`, { timeout: LOAD_TIMEOUT });
}

test.describe('1. 基本的な地図表示', () => {
  test('1.1 ページ読み込み時に地図が表示されること', async ({ page }) => {
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
    const mapContainer = await page.locator('.geolonia');
    await expect(mapContainer).toBeVisible();
    const canvas = await page.locator('.geolonia canvas');
    await expect(canvas).toBeVisible();
  });

  test('1.2 デフォルトで原点に地図が表示されること', async ({ page }) => {
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
    const center = await page.evaluate(() => {
      // @ts-ignore
      const map = new (window as any).geolonia.Map('map');
      return map.getCenter();
    });
    // 日本のおおよその中心座標
    expect(center.lat).toBeCloseTo(0.0, 0);
    expect(center.lng).toBeCloseTo(0.0, 0);
  });

  test('1.3 コンソールエラーが発生していないこと', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
    expect(consoleErrors).toHaveLength(0);
  });
});

