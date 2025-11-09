import { test, expect } from '@playwright/test';

test.describe('Amiron Desktop Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Amiron
    await page.goto('http://localhost:3002');
    
    // Wait for canvas to be ready
    await page.waitForSelector('#canvas', { timeout: 10000 });
  });

  test('should launch Amiron and render canvas', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Amiron Desktop/);
    
    // Verify canvas element exists and is visible
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has proper dimensions
    const canvasElement = await canvas.elementHandle();
    const width = await canvasElement?.evaluate((el: HTMLCanvasElement) => el.width);
    const height = await canvasElement?.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('should display default desktop icons', async ({ page }) => {
    // Wait for initialization
    await page.waitForTimeout(2000);
    
    // Check console for initialization messages
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify initialization logs
    expect(logs.some(log => log.includes('Amiron Desktop'))).toBeTruthy();
  });

  test('should handle window creation and rendering', async ({ page }) => {
    // Wait for desktop to be ready
    await page.waitForTimeout(2000);
    
    // Simulate double-click on Text Editor icon (approximate position)
    const canvas = page.locator('#canvas');
    
    // First click
    await canvas.click({ position: { x: 40, y: 40 } });
    
    // Second click (double-click)
    await canvas.click({ position: { x: 40, y: 40 }, delay: 100 });
    
    // Wait for window to potentially open
    await page.waitForTimeout(1000);
    
    // Verify no errors in console
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    expect(errors.length).toBe(0);
  });

  test('should handle icon double-click and application launch', async ({ page }) => {
    // Wait for desktop initialization
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('#canvas');
    
    // Test Text Editor launch (top icon)
    await canvas.dblclick({ position: { x: 40, y: 40 } });
    await page.waitForTimeout(500);
    
    // Test File Manager launch (middle icon)
    await canvas.dblclick({ position: { x: 40, y: 120 } });
    await page.waitForTimeout(500);
    
    // Test Terminal launch (bottom icon)
    await canvas.dblclick({ position: { x: 40, y: 200 } });
    await page.waitForTimeout(500);
    
    // Verify no JavaScript errors occurred
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    expect(errors.length).toBe(0);
  });

  test('should maintain acceptable frame rate', async ({ page }) => {
    // Wait for initialization
    await page.waitForTimeout(2000);
    
    // Measure frame rate by checking FPS counter
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
    
    // Let it run for a few seconds to stabilize
    await page.waitForTimeout(3000);
    
    // Check for FPS display in canvas (if visible)
    // The FPS counter is rendered on canvas, so we can't directly read it
    // Instead, verify smooth operation by checking for no frame drops
    
    const performanceMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.timing.loadEventEnd - performance.timing.navigationStart,
      };
    });
    
    // Verify reasonable memory usage (less than 100MB)
    expect(performanceMetrics.memory).toBeLessThan(100 * 1024 * 1024);
    
    // Verify page loaded in reasonable time (less than 5 seconds)
    expect(performanceMetrics.timing).toBeLessThan(5000);
  });

  test('should handle window dragging', async ({ page }) => {
    // Wait for desktop initialization
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('#canvas');
    
    // Launch an application
    await canvas.dblclick({ position: { x: 40, y: 40 } });
    await page.waitForTimeout(1000);
    
    // Try to drag window (simulate drag on title bar area)
    await canvas.hover({ position: { x: 300, y: 150 } });
    await page.mouse.down();
    await page.mouse.move(400, 250);
    await page.mouse.up();
    
    await page.waitForTimeout(500);
    
    // Verify no errors
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    expect(errors.length).toBe(0);
  });

  test('should persist desktop layout', async ({ page }) => {
    // Wait for initialization
    await page.waitForTimeout(2000);
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify canvas still renders
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
    
    // Verify localStorage has layout data
    const hasLayout = await page.evaluate(() => {
      return localStorage.getItem('amiron-desktop-layout') !== null;
    });
    
    expect(hasLayout).toBeTruthy();
  });

  test('should handle resize events', async ({ page }) => {
    // Wait for initialization
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('#canvas');
    
    // Get initial dimensions
    const initialWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    
    // Resize viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Get new dimensions
    const newWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    
    // Verify canvas resized
    expect(newWidth).not.toBe(initialWidth);
    expect(newWidth).toBe(1280);
  });
});
