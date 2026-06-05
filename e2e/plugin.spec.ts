import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad } from './helper';

// embed (wrapper) 固有: registerPlugin で登録した callback が auto-render された全 map に対し
// (map, target, atts) 付きで呼ばれる。maps-core にプラグイン機構は無い。
test.describe('プラグインシステム (wrapper-only)', () => {
  test('registerPlugin の callback が各 map に対し正しい引数で呼ばれる', async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/plugin.html`);

    await waitForStyleLoad(page, '#map-1');
    await waitForStyleLoad(page, '#map-2');

    // plugin は DOMContentLoaded 時に登録 → キューされた全 map に対して実行される
    await page.waitForFunction(() => (window as any).__pluginCalls?.length === 2, undefined, {
      timeout: 2000,
    });

    const calls = await page.evaluate(() => (window as any).__pluginCalls);
    expect(calls).toHaveLength(2);
    expect(calls.map((c: any) => c.targetId).sort()).toEqual(['map-1', 'map-2']);
    // atts は parse-atts が container.dataset を spread したもの。data-lat は文字列で渡る。
    expect(calls.find((c: any) => c.targetId === 'map-1').lat).toBe('35');
  });
});
