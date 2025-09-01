import { Page } from '@playwright/test';
// テスト用の設定
export const TEST_URL = 'http://localhost:3000/e2e';
export const LOAD_TIMEOUT = 5000;

// ヘルパー関数
export async function waitForMapLoad(page: Page, selector = '.geolonia') {
  // 地図コンテナの存在を確認
  await page.waitForSelector(selector);
  // Maplibreのcanvasが表示されるまで待機
  await page.waitForSelector(`${selector} canvas`, { timeout: LOAD_TIMEOUT });
}
