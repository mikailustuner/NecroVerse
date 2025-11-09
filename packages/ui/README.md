# UI Components

React components for Necroverse applications.

## Features

- **Button**: Styled button component
- **CRTOverlay**: CRT scanline effect overlay
- **GlitchText**: Glitch text effect component
- **LoadingRing**: Loading spinner component
- **Toast**: Toast notification component
- **ErrorDisplay**: Error display component
- **PlaybackControls**: Playback control component
- **PerformanceMonitor**: Performance monitoring component
- **VisualControls**: Visual enhancement controls
- **Debugger**: ActionScript debugger interface
- **ShareDialog**: Share dialog component
- **Comments**: Comments component
- **FileComparison**: File comparison component
- **VersionHistory**: Version history component
- **BatchConverter**: Batch conversion component

## Installation

```bash
pnpm install @necroverse/ui
```

## Usage

```typescript
import { Button, PlaybackControls, PerformanceMonitor } from "@necroverse/ui";

function MyComponent() {
  return (
    <div>
      <Button variant="primary" onClick={() => {}}>
        Click Me
      </Button>
      <PlaybackControls
        isPlaying={false}
        currentFrame={1}
        totalFrames={10}
        onPlay={() => {}}
        onPause={() => {}}
      />
      <PerformanceMonitor metrics={{ fps: 60, frameTime: 16.67 }} />
    </div>
  );
}
```

## Components

### Button

Styled button with variants (primary, secondary).

### PlaybackControls

Playback controls with timeline scrubber and speed control.

### PerformanceMonitor

Performance monitoring dashboard with FPS, frame time, and memory usage.

### VisualControls

Visual enhancement controls (CRT scanlines, pixel perfect, zoom, screenshot).

### Debugger

ActionScript debugger with variable inspector, call stack, and breakpoints.

## Theme

Components use a consistent theme with dark colors and purple accents.

## License

MIT

