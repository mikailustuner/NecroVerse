/**
 * Example: Optimized Desktop Setup
 * 
 * This example demonstrates how to use all performance optimizations together.
 */

import { Desktop, globalAppLoader } from '@amiron/workbench';
import { Renderer, globalEventPool } from '@amiron/intuition';
import { CanvasGraphics } from '@amiron/pal';

export function createOptimizedDesktop(canvas: HTMLCanvasElement) {
  // Initialize graphics context
  const graphics = new CanvasGraphics(canvas);
  
  // Create renderer with FPS counter (disable in production)
  const renderer = new Renderer(graphics, true);
  
  // Create desktop with global app loader
  const desktop = new Desktop(globalAppLoader);
  
  // Register applications with lazy loading
  desktop.registerLazyApplication(
    'text-editor',
    () => import('../../../apps/amiron/src/apps/text-editor').then(m => ({ default: m.createTextEditor }))
  );
  
  desktop.registerLazyApplication(
    'file-manager',
    () => import('../../../apps/amiron/src/apps/file-manager').then(m => ({ default: m.createFileManager }))
  );
  
  desktop.registerLazyApplication(
    'terminal',
    () => import('../../../apps/amiron/src/apps/terminal').then(m => ({ default: m.createTerminal }))
  );
  
  // Optional: Preload critical applications
  globalAppLoader.preload('text-editor').catch(console.error);
  
  // Set up event handling with object pooling
  canvas.addEventListener('click', (e) => {
    const event = globalEventPool.acquire('click', { x: e.clientX, y: e.clientY }, e.button);
    
    // Handle event
    desktop.handleDoubleClick(event.position);
    
    // Mark dirty region for redraw
    renderer.markDirty(event.position.x - 50, event.position.y - 50, 100, 100);
    
    // Release event back to pool
    globalEventPool.release(event);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    const event = globalEventPool.acquire('mousemove', { x: e.clientX, y: e.clientY });
    
    // Handle event
    desktop.handleMouseMove(event.position);
    
    // Mark dirty region for cursor area
    renderer.markDirty(event.position.x - 10, event.position.y - 10, 20, 20);
    
    // Release event back to pool
    globalEventPool.release(event);
  });
  
  canvas.addEventListener('mousedown', (e) => {
    const event = globalEventPool.acquire('mousedown', { x: e.clientX, y: e.clientY }, e.button);
    
    // Handle event
    desktop.handleMouseDown(event.position);
    
    // Mark full redraw for window focus changes
    renderer.markDirty(0, 0, canvas.width, canvas.height);
    
    // Release event back to pool
    globalEventPool.release(event);
  });
  
  canvas.addEventListener('mouseup', (e) => {
    const event = globalEventPool.acquire('mouseup', { x: e.clientX, y: e.clientY }, e.button);
    
    // Handle event
    desktop.handleMouseUp();
    
    // Release event back to pool
    globalEventPool.release(event);
  });
  
  // Load desktop layout
  desktop.loadLayout();
  
  // Set up render loop
  renderer.setWindows(desktop.windows);
  
  // Custom render function that includes desktop
  const originalRender = renderer['render'].bind(renderer);
  renderer['render'] = function() {
    desktop.render(graphics);
    // Note: Desktop render already handles windows
  };
  
  // Start rendering
  renderer.start();
  
  return { desktop, renderer };
}

/**
 * Performance monitoring helper
 */
export function monitorPerformance(renderer: Renderer) {
  setInterval(() => {
    const fps = renderer.getFPS();
    const frameTime = renderer.getFrameTime();
    
    console.log(`Performance: ${fps} FPS | ${frameTime.toFixed(2)}ms frame time`);
    
    if (fps < 30) {
      console.warn('⚠️ Low frame rate detected');
    }
  }, 5000);
}
