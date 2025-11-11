import { test, expect } from '@playwright/test';
import { TEST_URL, LOAD_TIMEOUT, waitForMapLoad } from './helper';

test.describe('1. 基本的な地図表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}/nocontrol.html`);
    await waitForMapLoad(page);
  });

  test.describe.serial('2.1 地図が表示できること', () => {
    test('2.1.1 ページ読み込み時に地図がロードされること', async ({ page }) => {
      // MapLibre GLのmapインスタンスがロードされるまで待つ
      try {
        await page.waitForFunction(() => {
          const map = new window.geolonia.Map('map');
          // 地図が完全に読み込まれたかどうか
          return map && map.loaded();
        }, { timeout: LOAD_TIMEOUT });
        // 成功
      } catch {
        // タイムアウト
        expect(false).toBe(true); // テスト失敗
      }
    });
    test('2.1.2 タイルが描画されていることを確認（上半分のみ）', async ({ page }) => {
      const isNotBlank = await page.evaluate(() => {
        const canvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement;
        // WebGLコンテキストを取得
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
          return false; // WebGLコンテキストが取得できない場合
        }

        const width = canvas.width;
        const height = Math.floor(canvas.height / 2); // 上半分のみ
        // ピクセルデータを読み取る
        const pixels = new Uint8Array(width * height * 4);

        // 下にAttributeがある場合、真っ白ではないため上半分だけを取得
        // WebGLは下から上に向かって読み取るので、上半分を取得するには
        // 下半分をスキップする必要がある
        gl.readPixels(0, Math.floor(canvas.height / 2), width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        // 色の分析
        let nonWhiteCount = 0;
        const totalPixels = pixels.length / 4;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // 白以外のピクセルをカウント
          if (r < 250 || g < 250 || b < 250) {
            nonWhiteCount++;

            // 早期終了：十分な非白色ピクセルが見つかったら
            if (nonWhiteCount > totalPixels * 0.01) {
              return true;
            }
          }
        }

        return nonWhiteCount > 0;
      });
      expect(isNotBlank).toBe(true);
    });
  });
});
