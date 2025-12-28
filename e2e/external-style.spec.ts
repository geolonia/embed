import { test, expect } from '@playwright/test';

test.describe('External Style Support', () => {
  test('should render map with external OSM Bright style', async ({ page }) => {
    await page.goto('/e2e/external-style.html');

    // Wait for map to be loaded
    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    });

    // Check if map is rendered
    const mapCanvas = await page.locator('#map canvas.maplibregl-canvas');
    await expect(mapCanvas).toBeVisible();

    // Verify that the map has loaded
    const isMapLoaded = await page.evaluate(() => {
      const container = document.querySelector('#map') as any;
      const map = container.geoloniaMap;
      return map && map.loaded();
    });

    expect(isMapLoaded).toBe(true);
  });

  test('should warn about missing API key but still work with external style', async ({
    page,
  }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto('/e2e/external-style.html');

    // Wait for map to be loaded
    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    });

    // Check if warning about API key was shown
    const hasApiKeyWarning = consoleMessages.some((msg) =>
      msg.includes('API key not found'),
    );
    expect(hasApiKeyWarning).toBe(true);
  });

  test('should log external style loading info', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto('/e2e/external-style.html');

    // Wait for map to be loaded
    await page.waitForFunction(() => {
      const container = document.querySelector('#map');
      return container && (container as any).geoloniaMap;
    });

    // Check if external style loading log was shown
    const hasExternalStyleLog = consoleMessages.some((msg) =>
      msg.includes('Loading external style from'),
    );
    expect(hasExternalStyleLog).toBe(true);
  });
});
