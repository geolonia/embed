import { test, expect } from '@playwright/test';
import { TEST_URL, mockGeoloniaTiles, waitForStyleLoad } from './helper';

/**
 * embed は UMD で配る。maplibre-gl v6 の worker は `import.meta.url` 基準で解決される
 * が、UMD 出力では webpack が `import.meta.url` をビルドマシンのファイルパスへ置換する
 * ため、maplibre は worker URL を空文字へフォールバックする。この失敗は例外もコンソール
 * エラーも出さず「地図だけが出ない」形で現れるので、worker が実際に登録されているかを
 * 明示的に確かめる (#518)。
 *
 * 実体は `src/lib/maplibre-worker.ts` が worker をバンドル内の文字列から Blob URL 化して
 * `setWorkerUrl()` に渡している。
 */
test.describe('UMD バンドルの maplibre worker (#518)', () => {
  test('worker URL が Blob URL として登録され、スタイルが読み込まれる', async ({
    page,
  }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForStyleLoad(page, '#map');

    const workerUrl = await page.evaluate(() =>
      (window as any).geolonia.getWorkerUrl(),
    );
    expect(workerUrl).toMatch(/^blob:/);
  });
});
