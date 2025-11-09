# Amiron Optimization Quick Reference

## Event Handling with Object Pooling

```typescript
import { globalEventPool } from '@amiron/intuition';

// ✅ GOOD: Use event pool
canvas.addEventListener('click', (e) => {
  const event = globalEventPool.acquire('click', { x: e.clientX, y: e.clientY });
  handleClick(event);
  globalEventPool.release(event);
});

// ❌ BAD: Create new objects
canvas.addEventListener('click', (e) => {
  const event = { type: 'click', position: { x: e.clientX, y: e.clientY } };
  handleClick(event);
});
```

## Dirty Region Tracking

```typescript
import { Renderer } from '@amiron/intuition';

const renderer = new Renderer(graphics);

// ✅ GOOD: Mark specific dirty regions
button.onClick = () => {
  renderer.markDirty(button.x, button.y, button.width, button.height);
};

// ❌ BAD: Force full redraw
button.onClick = () => {
  // Full screen redraw is expensive
};
```

## Lazy Loading Applications

```typescript
import { Desktop } from '@amiron/workbench';

const desktop = new Desktop();

// ✅ GOOD: Lazy load non-critical apps
desktop.registerLazyApplication(
  'text-editor',
  () => import('./apps/text-editor')
);

// ✅ ALSO GOOD: Preload critical apps
desktop.registerLazyApplication(
  'file-manager',
  () => import('./apps/file-manager')
);
globalAppLoader.preload('file-manager');

// ❌ BAD: Import everything upfront
import { createTextEditor } from './apps/text-editor';
import { createFileManager } from './apps/file-manager';
import { createTerminal } from './apps/terminal';
// ... all apps loaded immediately
```

## WASM Build

```bash
# ✅ GOOD: Release build with optimizations
cd packages/amiron-exec
wasm-pack build --target web --release

# ❌ BAD: Debug build (larger, slower)
wasm-pack build --target web --dev
```

## Performance Monitoring

```typescript
// Enable FPS counter during development
const renderer = new Renderer(graphics, true);

// Monitor performance
setInterval(() => {
  const fps = renderer.getFPS();
  const frameTime = renderer.getFrameTime();
  
  if (fps < 60) {
    console.warn(`Low FPS: ${fps}`);
  }
  
  if (frameTime > 16.67) {
    console.warn(`Slow frame: ${frameTime.toFixed(2)}ms`);
  }
}, 5000);
```

## Complete Example

```typescript
import { Desktop, globalAppLoader } from '@amiron/workbench';
import { Renderer, globalEventPool } from '@amiron/intuition';
import { CanvasGraphics } from '@amiron/pal';

// Initialize
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const graphics = new CanvasGraphics(canvas);
const renderer = new Renderer(graphics, true);
const desktop = new Desktop(globalAppLoader);

// Register apps with lazy loading
desktop.registerLazyApplication('text-editor', () => import('./apps/text-editor'));
desktop.registerLazyApplication('file-manager', () => import('./apps/file-manager'));

// Preload critical apps
globalAppLoader.preload('file-manager');

// Event handling with pooling
canvas.addEventListener('click', (e) => {
  const event = globalEventPool.acquire('click', { x: e.clientX, y: e.clientY });
  desktop.handleDoubleClick(event.position);
  renderer.markDirty(event.position.x - 50, event.position.y - 50, 100, 100);
  globalEventPool.release(event);
});

// Start
desktop.loadLayout();
renderer.setWindows(desktop.windows);
renderer.start();
```

## Checklist

Before deploying to production:

- [ ] All event handlers use `globalEventPool`
- [ ] UI updates call `renderer.markDirty()`
- [ ] Non-critical apps use lazy loading
- [ ] WASM built with `--release` flag
- [ ] FPS counter disabled in production
- [ ] Performance monitoring in place
- [ ] Load time < 3 seconds verified
- [ ] 60 FPS maintained with 5+ windows

## Troubleshooting

### Low FPS

1. Check if dirty regions are too large
2. Verify event pool is being used
3. Profile with browser DevTools
4. Reduce number of draw calls

### High Memory Usage

1. Verify events are released to pool
2. Check for memory leaks in applications
3. Monitor heap size over time
4. Use Chrome Memory Profiler

### Slow Initial Load

1. Verify lazy loading is configured
2. Check WASM build size
3. Measure network transfer time
4. Consider preloading critical apps

### Application Won't Launch

1. Check dynamic import path
2. Verify module exports `default` function
3. Check browser console for errors
4. Ensure app is registered before launch
