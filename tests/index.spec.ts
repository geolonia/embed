import { test, expect, Page } from '@playwright/test';

declare global {
  interface Window {
    _map: any;
  }
}

async function goTo(page: Page, url: string): Promise<any> {
  await page.goto(url);
  await page.waitForFunction(() => window._map !== undefined, { timeout: 10000 });
}

// 各テストの実行前に window._map を undefined に初期化
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window._map = undefined;
  });
});

test('中心が (35.6798619, 139.7648345) で、ズームレベル16でデフォルトのマーカーが表示されること', async ({ page }) => {

  await goTo(page, 'http://localhost:3000/index.html');

  const mapState = await page.evaluate(() => {
    return {
      center: window._map.getCenter(), // マップの中心座標を取得
      zoom: window._map.getZoom(),     // ズームレベルを取得
    };
  });

  // 中心座標およびズームレベルの検証
  expect(mapState.center.lat).toBeCloseTo(35.6798619, 5);
  expect(mapState.center.lng).toBeCloseTo(139.7648345, 5);
  expect(mapState.zoom).toBe(16);

  // マーカーの存在確認
  const marker = await page.waitForSelector('.geolonia-default-marker', { timeout: 10000 });
  expect(marker).not.toBeNull();
});
