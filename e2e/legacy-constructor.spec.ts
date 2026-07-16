import { test, expect } from '@playwright/test';
import { Geolonia } from '../src/embed';
import {
  TEST_URL,
  mockGeoloniaTiles,
  waitForStyleLoad,
  getCenter,
  getZoom,
  hasMapInstance,
} from './helper';

declare global {
  interface Window {
    geolonia: Geolonia;
  }
}

/**
 * maps-core#90 を embed 経由で検証する。embed は `window.geolonia.Map` に
 * maps-core の GeoloniaMap をそのまま公開しているため、旧 embed 由来の呼び出し
 * 規約 —— CSS セレクタ文字列 / HTMLElement / options オブジェクト —— が
 * wrapper 越しに壊れていないことをここで守る。
 *
 * legacy 形式 (文字列 / 要素) のときにコンテナの data-* を読むのは maps-core#90 の
 * legacy パスの責務で、embed 側の parse-atts (auto-scan 経路) とは別。よって
 * コンテナには `.geolonia` を付けず、auto-render と混ざらない状態で構築する。
 */
test.describe('legacy コンストラクタ引数 (maps-core#90, wrapper 経由)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/legacy-constructor.html`);
    // embed バンドルのロード (window.geolonia.Map の公開) を待つ。
    await page.waitForFunction(
      () => typeof window.geolonia?.Map === 'function',
    );
  });

  test('CSS セレクタ文字列で構築し、その要素の data-* を反映する', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const map = new window.geolonia.Map('#map-selector');
      return map.getContainer().id;
    });
    await waitForStyleLoad(page, '#map-selector');

    expect(await hasMapInstance(page, '#map-selector')).toBe(true);
    const center = await getCenter(page, '#map-selector');
    expect(center.lat).toBeCloseTo(35, 4);
    expect(center.lng).toBeCloseTo(139, 4);
    expect(await getZoom(page, '#map-selector')).toBeCloseTo(10, 4);
  });

  test('HTMLElement で構築し、その要素の data-* を反映する', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('map-element');
      if (!el) throw new Error('fixture #map-element missing');
      const map = new window.geolonia.Map(el);
      return map.getContainer().id;
    });
    await waitForStyleLoad(page, '#map-element');

    const center = await getCenter(page, '#map-element');
    expect(center.lat).toBeCloseTo(34, 4);
    expect(center.lng).toBeCloseTo(135, 4);
    expect(await getZoom(page, '#map-element')).toBeCloseTo(8, 4);
  });

  test('options オブジェクトは data-* を読まず、options が優先される', async ({
    page,
  }) => {
    // #map-options には decoy の data-zoom="2" があるが、object 形式では読まれず
    // options.center / zoom が使われる (maps-core#90 の「object 素通し」契約)。
    await page.evaluate(() => {
      const map = new window.geolonia.Map({
        container: '#map-options',
        center: [140, 36],
        zoom: 7,
      });
      return map.getContainer().id;
    });
    await waitForStyleLoad(page, '#map-options');

    const center = await getCenter(page, '#map-options');
    expect(center.lat).toBeCloseTo(36, 4);
    expect(center.lng).toBeCloseTo(140, 4);
    // data-zoom="2" ではなく options.zoom=7 が効く。
    expect(await getZoom(page, '#map-options')).toBeCloseTo(7, 4);
  });

  test('存在しないセレクタは Geolonia のエラーを投げる', async ({ page }) => {
    const message = await page.evaluate(() => {
      try {
        const map = new window.geolonia.Map('#no-such-container');
        return map.getContainer().id;
      } catch (e) {
        return (e as Error).message;
      }
    });
    expect(message).toMatch(/No HTML elements found/);
  });
});
