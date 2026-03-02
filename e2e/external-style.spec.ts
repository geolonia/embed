import { test, expect } from '@playwright/test';
import { TEST_URL, LOAD_TIMEOUT } from './helper';

test.describe('External Style Support', () => {
  test('should render map with external OSM Bright style', async ({ page }) => {
    await page.goto(`${TEST_URL}/external-style.html`);

    // Wait for map object to be created
    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    }, { timeout: LOAD_TIMEOUT });

    // Check that the map container and canvas are visible
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();
    const mapCanvas = page.locator('#map canvas.maplibregl-canvas');
    await expect(mapCanvas).toBeVisible();

    // Verify that the map instance has the correct center from data attributes
    const center = await page.evaluate(() => {
      const container = document.querySelector('#map') as any;
      return container.geoloniaMap.getCenter();
    });
    expect(center.lat).toBeCloseTo(35.6812, 1);
    expect(center.lng).toBeCloseTo(139.7671, 1);
  });

  test('should not throw errors when using external style without API key', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${TEST_URL}/external-style.html`);

    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    }, { timeout: LOAD_TIMEOUT });

    // External style should work without API key errors
    const hasApiKeyError = consoleErrors.some((msg) =>
      msg.includes('API key'),
    );
    expect(hasApiKeyError).toBe(false);
  });

  test('should display map tiles from external source', async ({ page }) => {
    await page.goto(`${TEST_URL}/external-style.html`);

    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    }, { timeout: LOAD_TIMEOUT });

    // Verify canvas has rendered content (not blank)
    const isNotBlank = await page.evaluate(() => {
      const canvas = document.querySelector('#map canvas.maplibregl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return false;

      const width = canvas.width;
      const height = Math.floor(canvas.height / 2);
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, Math.floor(canvas.height / 2), width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      let nonWhiteCount = 0;
      const totalPixels = pixels.length / 4;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] < 250 || pixels[i + 1] < 250 || pixels[i + 2] < 250) {
          nonWhiteCount++;
          if (nonWhiteCount > totalPixels * 0.01) return true;
        }
      }
      return nonWhiteCount > 0;
    });

    expect(isNotBlank).toBe(true);
  });
});
