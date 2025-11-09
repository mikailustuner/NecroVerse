# @amiron/pal

Platform Abstraction Layer for Amiron - provides unified interfaces to browser APIs.

## Modules

### Graphics (`graphics.ts`)
- Canvas 2D rendering abstraction
- Drawing primitives (rectangles, text, images)
- Color management

### Storage (`storage.ts`)
- IndexedDB-based virtual file system
- File operations (read, write, list, delete)
- Directory management

### Audio (`audio.ts`)
- Web Audio API wrapper
- Sound playback with volume control
- Low-latency audio support

### Types (`types.ts`)
- Common types (Point, Rect, Color, Font)
- Shared across all Amiron packages

## Usage

```typescript
import { CanvasGraphics, IndexedDBFileSystem } from '@amiron/pal';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const graphics = new CanvasGraphics(canvas);

const fs = new IndexedDBFileSystem();
await fs.init();
```
