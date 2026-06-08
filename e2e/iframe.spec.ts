import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForMapLoad, hasMapInstance } from './helper';

// embed (wrapper) 固有: checkPermission() による iframe 埋め込み制限。
// maps-core にこのゲートは無い。
//
// 拒否される側 (iframe + API key 無し + 非特例 origin) の E2E 再現は難しいため skip し、
// ここでは「非 iframe では拒否されず描画される」= 許可側の経路のみを守る。
test.describe('iframe 許可チェック / checkPermission (wrapper-only)', () => {
  test('非 iframe では拒否されず地図が描画される (iframe 拒否メッセージが出ない)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);

    // 描画されている = checkPermission が許可した
    expect(await hasMapInstance(page, '#map')).toBe(true);

    // iframe 拒否のメッセージは出ていないこと
    expect(consoleErrors.some((t) => t.includes("can't display our map in iframe"))).toBe(false);
  });

  // 拒否ケース (iframe + API key 無し → console.error) は E2E では再現が難しい:
  //  - ローカルでは特例 origin (codepen 等) + referrer を満たせない
  //  - child frame の console は親フレームから capture しにくい
  // このゲートは checkPermission() のユニットテスト (window.self/parent/location をモック) で
  // 検証する方が現実的。E2E では skip する (silent に落とさず明示)。
  test.skip('iframe + API key 無し → 拒否される (ユニットテストで担保)', async () => {
    // intentionally skipped — see comment above
  });
});
