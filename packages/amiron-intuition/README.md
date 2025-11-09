# @amiron/intuition

Lightweight GUI framework for Amiron with NecroNet aesthetics.

## Features

- Window management with title bars and borders
- Widget system (Button, Label, TextField)
- Event handling (mouse, keyboard)
- NecroNet dark theme (purple/cyan palette)
- Workbench-inspired visual style

## Usage

```typescript
import { Window, Button, NecroTheme } from '@amiron/intuition';

const window = new Window('My App', { x: 100, y: 100, width: 400, height: 300 });

const button = new Button(
  { x: 150, y: 150, width: 100, height: 30 },
  'Click Me',
  () => console.log('Clicked!')
);

window.addWidget(button);
window.render(graphics);
```

## Theme

The NecroTheme provides the dark purple/cyan color scheme matching the NecroNet website:

- Background: `#0a0612` (deep void purple)
- Accent: `#a855f7` (violet glow)
- Highlight: `#00fff7` (cyan)
- Text: `#f5f5f5` (off-white)
