import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad } from './helper';

// embed (wrapper) 固有: MutationObserver でコンテナの DOM 削除を検知し map.remove() を呼ぶ。
// maps-core にはこの自動 cleanup は無い (明示 remove() のみ)。
test.describe('MutationObserver cleanup (wrapper-only)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/cleanup.html`);
    await waitForStyleLoad(page, '#map');
  });

  test('コンテナを DOM から削除すると map.remove() が発火する', async ({ page }) => {
    await page.evaluate(() => {
      const map = (document.querySelector('#map') as any).geoloniaMap;
      (window as any).__removeFired = false;
      map.on('remove', () => {
        (window as any).__removeFired = true;
      });
    });

    await page.evaluate(() => document.querySelector('#map')?.remove());

    // MutationObserver は非同期で発火するため待つ
    await page.waitForFunction(() => (window as any).__removeFired === true, undefined, {
      timeout: 1000,
    });
    expect(await page.evaluate(() => (window as any).__removeFired)).toBe(true);
  });

  test('同じコンテナへ再度 new すると同一インスタンスが返る (二重初期化防止)', async ({ page }) => {
    const sameInstance = await page.evaluate(() => {
      const container = document.querySelector('#map') as any;
      const a = container.geoloniaMap;
      const b = new (window as any).geolonia.Map(container);
      return a === b;
    });
    expect(sameInstance).toBe(true);
  });
});
