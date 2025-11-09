# @amiron/workbench

Desktop shell for Amiron - manages icons, windows, and application launching.

## Features

- Desktop icon system
- Window management (z-order, focus)
- Icon drag-and-drop
- Layout persistence (localStorage)
- Application launching

## Usage

```typescript
import { Desktop } from '@amiron/workbench';

const desktop = new Desktop();

// Add an icon
desktop.addIcon({
  label: 'Text Editor',
  image: null,
  position: { x: 20, y: 20 },
  target: 'text-editor',
});

// Load saved layout
desktop.loadLayout();

// Render
desktop.render(graphics);
```

## Desktop Layout

Icons are arranged in a grid on the left side of the screen. Double-clicking an icon launches the associated application.

Layout is automatically saved to localStorage when icons are added or moved.
