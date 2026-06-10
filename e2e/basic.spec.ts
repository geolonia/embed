import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForMapLoad } from './helper';

// 統合スモーク (embed-only): script タグ読込 → auto-render → canvas 描画 までが
// end-to-end で繋がっていることだけを1本で保証する。
// 個別の表示・機能は maps-core 側 E2E が担保し、embed 固有挙動は他の spec が担保する。
test.describe('統合スモーク', () => {
  test('script タグ読込で .geolonia が auto-render され canvas が描画される', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);

    await expect(page.locator('.geolonia')).toBeVisible();
    await expect(page.locator('.geolonia canvas')).toBeVisible();
  });
});
