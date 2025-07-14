import { test, expect } from '@playwright/test';
import { Geolonia } from '../src/embed';
import { TEST_URL, waitForMapLoad } from './helper';

declare global {
  interface Window {
    geolonia: Geolonia,
    maplibregl?: Geolonia,
    mapboxgl?: Geolonia,
  }
}

test.describe('1. 基本的な地図表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
  });

  test('1.1 ページ読み込み時に地図が表示されること', async ({ page }) => {
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
    const mapContainer = page.locator('.geolonia');
    await expect(mapContainer).toBeVisible();
    const canvas = page.locator('.geolonia canvas');
    await expect(canvas).toBeVisible();
  });

  test('1.2 デフォルトで原点に地図が表示されること', async ({ page }) => {
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
    const center = await page.evaluate(() => {
      const map = new window.geolonia.Map('map');
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

