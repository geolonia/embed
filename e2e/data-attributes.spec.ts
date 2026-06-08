import { test, expect } from '@playwright/test';
import {
  TEST_URL,
  mockGeoloniaTiles,
  waitForStyleLoad,
  getCenter,
  getZoom,
  getBearing,
  getPitch,
} from './helper';

// embed (wrapper) 固有: HTML の data-* 属性を読んで GeoloniaMapOptions に渡すのは
// parse-atts.ts (embed のみ)。maps-core は options オブジェクト受け取りで data-* を読まない。
// よってここで守るのは「data-* を正しくパースして地図に転送できているか」というフォワーディング層。
// 各オプションが実際にどう描画されるか (option → 挙動) は maps-core 側 E2E が担保する。
test.describe('data-* → options フォワーディング (wrapper-only)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/data-attributes.html`);
    await waitForStyleLoad(page, '#map');
  });

  test('data-lat / data-lng が中心座標に反映される', async ({ page }) => {
    const center = await getCenter(page, '#map');
    expect(center.lat).toBeCloseTo(35, 4);
    expect(center.lng).toBeCloseTo(139, 4);
  });

  test('data-zoom が反映される', async ({ page }) => {
    expect(await getZoom(page, '#map')).toBeCloseTo(10, 4);
  });

  test('data-bearing / data-pitch が反映される', async ({ page }) => {
    expect(await getBearing(page, '#map')).toBeCloseTo(30, 4);
    expect(await getPitch(page, '#map')).toBeCloseTo(20, 4);
  });
});
