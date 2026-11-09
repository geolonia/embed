import { describe, it, expect } from 'vitest';

// maplibre-gl v6 にデフォルトエクスポートは無いので名前空間でインポートする。
import * as maplibregl from 'maplibre-gl';

/**
 * このテストは、jsdom環境ではmaplibre-glのMapインスタンスが
 * WebGL不足のため生成できないことを「動作証跡付き」でドキュメント化するものです。
 * 実際の描画テストはE2Eテストで行ってください。
 */

describe('maplibre-gl jsdom limitation', () => {
  it('jsdom上ではMaplibre Mapインスタンス生成時にエラー（WebGL未対応のため）', () => {
    // vitest.config.ts の environment: 'jsdom' が用意する document を使う。
    // 以前はここで JSDOM を自前に生成して global.window / global.document を
    // 差し替えていたが、vitest 5 では jsdom 環境の document が getter のみになり
    // 代入できない (Cannot set property document of [object Window])。
    // 環境として jsdom が既にあるので、器だけ用意すれば足りる。
    document.body.innerHTML = '<div id="map"></div>';

    let errorCaught: unknown = null;
    try {
      new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [139.767, 35.681],
        zoom: 10,
      });
    } catch (err) {
      errorCaught = err;
    }
    expect(errorCaught).toBeInstanceOf(Error);
    expect(
      /webgl|WebGL|context|device|Not implemented/i.test(
        (errorCaught as Error).message,
      ),
    ).toBe(true);

    // 実行すると jsdom が
    //   Not implemented: HTMLCanvasElement's getContext() method
    // をテスト出力に書く。これは失敗ではなく、このテストが記録している
    // 「jsdom には WebGL が無い」ことの証跡そのもの。
    //
    // 以前は console.error を spy で潰していたが、vitest 5 では jsdom 環境が
    // 環境セットアップ時に VirtualConsole を作るため、テスト内で貼る spy では
    // もう捕まえられない (environmentOptions.jsdom.console: true でも同じ)。
    // 何も抑制しない spy を残すと誤解を生むので外してある。
  });

  it('【NOTE】描画テストが必要な場合はE2E（ブラウザ実行）で行うこと', () => {
    expect(true).toBe(true);
  });
});
