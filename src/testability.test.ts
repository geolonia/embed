import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// maplibre-gl v6 にデフォルトエクスポートは無いので名前空間でインポートする。
import * as maplibregl from 'maplibre-gl';

/**
 * このテストは、jsdom環境ではmaplibre-glのMapインスタンスが
 * WebGL不足のため生成できないことを「動作証跡付き」でドキュメント化するものです。
 * 実際の描画テストはE2Eテストで行ってください。
 */

describe('maplibre-gl jsdom limitation', () => {
  it('jsdom上ではMaplibre Mapインスタンス生成時にエラー（WebGL未対応のため）', () => {
    // jsdom の "Not implemented" メッセージを抑制
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const dom = new JSDOM(
      '<!DOCTYPE html><html><body><div id="map"></div></body></html>',
      {
        url: 'http://localhost',
        pretendToBeVisual: true,
      },
    );
    // @ts-ignore
    global.window = dom.window;
    global.document = dom.window.document;
    let errorCaught = null;
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
      /webgl|WebGL|context|device|Not implemented/i.test(errorCaught.message),
    ).toBe(true);

    consoleSpy.mockRestore();
  });

  it('【NOTE】描画テストが必要な場合はE2E（ブラウザ実行）で行うこと', () => {
    expect(true).toBe(true);
  });
});
