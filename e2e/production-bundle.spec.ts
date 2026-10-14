import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_URL, mockGeoloniaTiles, waitForStyleLoad } from './helper';

/**
 * production 出力 (`dist/embed.js` を docs/ へコピーしたもの) を直接読み込んで検証する。
 *
 * 他の spec が読む `../embed` は dev サーバーが生成するバンドルで、mode も
 * minify も production とは別物。配布するのは production 出力のほうなのに、
 * これまでどこでも実行されていなかった。
 *
 * minify やローダーの更新で production だけが壊れる事故を拾うのが目的。実際
 * #527 の css-loader 7 / style-loader 4 への更新では、production バンドルが
 * CSS を注入できるかを確かめる手段が無く、その場限りのテストを書いて確認していた。
 */
const BUNDLE_URL = `${BASE_URL}/embed.js`;

test.describe('production バンドル', () => {
  test('地図が描画され、CSS が注入される', async ({ page, request }) => {
    // `docs/embed.js` は .gitignore 対象で、`pnpm run build` でしか作られない。
    // CI は build ジョブの成果物を展開しているので、無ければ設定の不備として落とす。
    const bundle = await request.get(BUNDLE_URL);
    if (!bundle.ok()) {
      if (process.env.CI) {
        throw new Error(
          `${BUNDLE_URL} が ${bundle.status()} を返しました。` +
            'e2e ジョブで build ジョブの成果物が展開されているか確認してください。',
        );
      }
      test.skip(
        true,
        '`pnpm run build` を実行すると production バンドルの検証が走ります',
      );
    }

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/production-bundle.html`);
    await waitForStyleLoad(page, '#map');

    await expect(page.locator('#map canvas')).toBeVisible();

    // style-loader が maplibre の CSS を <style> として注入しているか。
    // ローダーの更新でここが壊れるとコントロール類の見た目だけが崩れ、
    // canvas は出るので気づきにくい。
    const injectedMaplibreCss = await page.evaluate(() =>
      [...document.querySelectorAll('style')].some((s) =>
        s.textContent?.includes('maplibregl-ctrl'),
      ),
    );
    expect(injectedMaplibreCss).toBe(true);

    expect(errors).toEqual([]);
  });
});
