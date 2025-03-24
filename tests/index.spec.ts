import { test, expect, Page } from '@playwright/test';

declare global {
  interface Window {
    _map: any;
  }
}

async function goTo(page: Page, url: string): Promise<any> {
  await page.goto(url);
  // ページ内のスクリプト実行完了まで待機し、window._map を取得
  await page.waitForFunction(() => window._map !== undefined, { timeout: 10000 });
}

test('should display map with center (35.6798619, 139.7648345) and zoom level 16', async ({ page }) => {

  // ページが読み込まれるまで待機
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
