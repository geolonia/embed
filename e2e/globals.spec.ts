import { test, expect } from '@playwright/test';
import { Geolonia } from '../src/embed';
import { TEST_URL, mockGeoloniaTiles, waitForMapLoad } from './helper';

declare global {
  interface Window {
    geolonia: Geolonia;
    maplibregl?: Geolonia;
    mapboxgl?: Geolonia;
  }
}

// embed (wrapper) 固有: embed.js を script タグで読むとグローバルが公開される。
// 表示・機能そのものは maps-core 側 E2E が担保するため、ここでは「公開」だけを守る。
test.describe('window グローバル公開 (wrapper-only)', () => {
  test.beforeEach(async ({ page }) => {
    await mockGeoloniaTiles(page);
    await page.goto(`${TEST_URL}/basic.html`);
    await waitForMapLoad(page);
  });

  test('window.geolonia がセットされ、主要メンバを含む', async ({ page }) => {
    const shape = await page.evaluate(() => ({
      geolonia: typeof window.geolonia,
      Map: typeof window.geolonia?.Map,
      Marker: typeof window.geolonia?.Marker,
      SimpleStyle: typeof window.geolonia?.SimpleStyle,
      registerPlugin: typeof window.geolonia?.registerPlugin,
      embedVersion: window.geolonia?.embedVersion,
    }));

    expect(shape.geolonia).toBe('object');
    expect(shape.Map).toBe('function');
    expect(shape.Marker).toBe('function');
    expect(shape.SimpleStyle).toBe('function');
    expect(shape.registerPlugin).toBe('function');
    expect(shape.embedVersion).toMatch(/^\d+\.\d+/);
  });

  test('window.maplibregl / window.mapboxgl が window.geolonia と同一参照', async ({ page }) => {
    const aliases = await page.evaluate(() => ({
      maplibregl: window.maplibregl === window.geolonia,
      mapboxgl: window.mapboxgl === window.geolonia,
      mapClass: window.maplibregl?.Map === window.geolonia.Map,
    }));

    expect(aliases.maplibregl).toBe(true);
    expect(aliases.mapboxgl).toBe(true);
    expect(aliases.mapClass).toBe(true);
  });
});
