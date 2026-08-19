import { test, expect } from '@playwright/test';
import { TEST_URL } from './helper';

/**
 * WebGL が使えない端末での表示。
 * フィクスチャ側で `getContext('webgl')` を null にして初期化を必ず失敗させている。
 */
test.describe('WebGL 初期化失敗時のエラー表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}/webgl-error.html`);
    await page.waitForSelector('#map-large .geolonia__error-container');
  });

  test('広い地図では復旧手順まで表示する', async ({ page }) => {
    const container = page.locator('#map-large');
    await expect(
      container.locator('.geolonia__error-message-title'),
    ).toHaveText('地図を表示できませんでした');
    await expect(
      container.locator('.geolonia__error-message-lead'),
    ).toBeVisible();
    await expect(
      container.locator('.geolonia__error-message-steps li'),
    ).toHaveCount(4);
    await expect(
      container.locator('.geolonia__error-message-contact'),
    ).toBeVisible();
    await expect(
      container.locator('.geolonia__error-message-brief'),
    ).toBeHidden();
  });

  test('開発者向けの案内文を表示しない', async ({ page }) => {
    await expect(page.locator('#map-large')).not.toContainText('開発者ツール');
  });

  test('中くらいの地図では短縮版に切り替わる', async ({ page }) => {
    const container = page.locator('#map-medium');
    await expect(
      container.locator('.geolonia__error-message-title'),
    ).toBeVisible();
    await expect(
      container.locator('.geolonia__error-message-brief'),
    ).toBeVisible();
    await expect(
      container.locator('.geolonia__error-message-steps'),
    ).toBeHidden();
  });

  test('小さい地図では見出しだけを表示する', async ({ page }) => {
    const container = page.locator('#map-small');
    await expect(
      container.locator('.geolonia__error-message-title'),
    ).toBeVisible();
    await expect(
      container.locator('.geolonia__error-message-brief'),
    ).toBeHidden();
    await expect(
      container.locator('.geolonia__error-message-steps'),
    ).toBeHidden();
  });

  test('エラー表示が地図コンテナからはみ出さない', async ({ page }) => {
    for (const id of ['#map-large', '#map-medium', '#map-small']) {
      const container = await page.locator(id).boundingBox();
      const message = await page
        .locator(`${id} .geolonia__error-message`)
        .boundingBox();
      expect(message.x).toBeGreaterThanOrEqual(container.x - 1);
      expect(message.y).toBeGreaterThanOrEqual(container.y - 1);
      expect(message.x + message.width).toBeLessThanOrEqual(
        container.x + container.width + 1,
      );
      expect(message.y + message.height).toBeLessThanOrEqual(
        container.y + container.height + 1,
      );
    }
  });

  test('data-error-message で文言を差し替えられる', async ({ page }) => {
    const container = page.locator('#map-custom');
    await expect(
      container.locator('.geolonia__error-message-description'),
    ).toHaveText(
      '地図を表示できませんでした。お手数ですが 0120-000-000 までご連絡ください。',
    );
    await expect(
      container.locator('.geolonia__error-message-steps'),
    ).toHaveCount(0);
  });

  test('data-error-message="off" でエラー表示を無効にできる', async ({
    page,
  }) => {
    await expect(
      page.locator('#map-off .geolonia__error-container'),
    ).toHaveCount(0);
  });

  test('初期化に失敗したらローディング表示を止める', async ({ page }) => {
    for (const id of ['#map-large', '#map-off']) {
      await expect(page.locator(`${id} .loading-geolonia-map`)).toHaveCount(0);
    }
  });
});
