import assert from 'assert';
import { chromium } from 'playwright';

declare global {
  interface Window {
    _map: any; // Replace 'any' with the actual type of your map if available
  }
}

describe('Geolonia Map Embed', function () {
  let browser;
  let page;

  // 初期化や通信に時間がかかる可能性があるため、タイムアウトを長めに設定
  this.timeout(15000);

  before(async () => {
    // Chromium ブラウザを起動
    browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();
    // テスト対象の HTML にアクセス（URL は環境に合わせて変更してください）
    await page.goto('http://localhost:3000/index.html');
    // マップの初期化完了を待機 (window.map にマップインスタンスがセットされることを想定)
    await page.waitForFunction(() => window._map !== undefined, { timeout: 10000 });
  });

  after(async () => {
    // テスト終了後、ブラウザを閉じる
    await browser.close();
  });

  it('should display map with center (35.6798619, 139.7648345) and zoom level 16', async () => {
    const mapState = await page.evaluate(() => {
      return {
        center: window._map.getCenter(), // MapLibre の getCenter() で中心座標を取得
        zoom: window._map.getZoom(),        // ズームレベルを取得
      };
    });

    //マップの中心座標とズームレベルを確認
    assert.strictEqual(mapState.center.lat, 35.6798619, 'Map center latitude should be 35.6798619');
    assert.strictEqual(mapState.center.lng, 139.7648345, 'Map center longitude should be 139.7648345');
    assert.strictEqual(mapState.zoom, 16, 'Map zoom level should be 16');

    // マーカーが存在するか確認
    const marker = await page.waitForFunction(() => document.querySelector('.geolonia-default-marker'), { timeout: 10000 });
    assert.strictEqual(marker !== null, true, 'Map should have a default marker');
  });
});
