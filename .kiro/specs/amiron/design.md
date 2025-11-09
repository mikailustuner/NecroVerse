# Amiron Design Document

## Overview

Amiron resurrects the AmigaOS philosophy in a web-first architecture with NecroNet's dark aesthetic. The system runs entirely in modern browsers using WebAssembly for core logic, Canvas/WebGPU for graphics, and Web Audio API for sound. The design embraces layered modularity inspired by AmigaOS while leveraging contemporary web standards and the existing NecroNet visual language.

The architecture prioritizes:
- **Instant Access**: No installation, runs in any modern browser
- **Low Latency**: WebAssembly + Canvas/WebGPU for smooth performance
- **Dark Retro Aesthetics**: Workbench-style UI with NecroNet purple/cyan palette
- **Modern Foundation**: Rust/TypeScript hybrid with clean separation of concerns

## Architecture

### Layered System Design

```
┌─────────────────────────────────────────────────┐
│         Application Layer                       │
│  (Text Editor, File Manager, Terminal)          │
├─────────────────────────────────────────────────┤
│         Ritual API (Public Interface)           │
│  (Task, Window, File, Audio APIs)               │
├─────────────────────────────────────────────────┤
│         Workbench Shell                         │
│  (Desktop, Icons, Menus, Drag-Drop)             │
├─────────────────────────────────────────────────┤
│         Intuition Engine (GUI Framework)        │
│  (Widgets, Events, Rendering, Themes)           │
├─────────────────────────────────────────────────┤
│         Exec Layer (Task Manager)               │
│  (Scheduling, Memory, Messages, Modules)        │
├─────────────────────────────────────────────────┤
│         Platform Abstraction Layer              │
│  (Canvas/WebGPU, Web Audio, IndexedDB)          │
└─────────────────────────────────────────────────┘
```

### Technology Stack

**Core Runtime:**
- **Rust** (compiled to WebAssembly) - Exec Layer, performance-critical code
- **TypeScript** - Intuition Engine, Workbench, Applications
- **WebAssembly** - Binary format for Rust modules

**Graphics & Media:**
- **Canvas 2D** - Primary rendering (universal browser support)
- **WebGPU** - Optional hardware acceleration for supported browsers
- **Web Audio API** - Low-latency audio with AudioWorklet

**Storage & State:**
- **IndexedDB** - Virtual file system persistence
- **localStorage** - User preferences, desktop layout
- **Zustand** - Client-side state management

**Build & Tooling:**
- **wasm-pack** - Rust to WebAssembly compilation
- **Vite** - Fast development server and bundling
- **TypeScript** - Type safety across JavaScript code

## Components and Interfaces

### 1. Platform Abstraction Layer (PAL)

Provides unified interface to browser APIs.

```typescript
// pal/graphics.ts
export interface GraphicsContext {
  createSurface(width: number, height: number): Surface;
  present(surface: Surface): void;
  clear(color: Color): void;
  drawRect(rect: Rect, color: Color): void;
  drawText(text: string, pos: Point, font: Font, color: Color): void;
  drawImage(image: ImageData, pos: Point): void;
}

export class CanvasGraphics implements GraphicsContext {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }
  
  clear(color: Color): void {
    this.ctx.fillStyle = this.colorToCSS(color);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawRect(rect: Rect, color: Color): void {
    this.ctx.fillStyle = this.colorToCSS(color);
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  private colorToCSS(color: Color): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }
}
```

```typescript
// pal/storage.ts
export interface FileSystem {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  listDir(path: string): Promise<FileEntry[]>;
  createDir(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

export class IndexedDBFileSystem implements FileSystem {
  private db: IDBDatabase;
  private readonly DB_NAME = 'amiron-fs';
  private readonly STORE_NAME = 'files';
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'path' });
        }
      };
    });
  }
  
  async readFile(path: string): Promise<Uint8Array> {
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const request = store.get(path);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          reject(new Error(`File not found: ${path}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 2. Exec Layer (Rust/WASM)

Microkernel-inspired task scheduler and memory manager.

```rust
// exec/src/lib.rs
use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct TaskId(u32);

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub enum TaskState {
    Ready,
    Running,
    Waiting,
    Terminated,
}

#[wasm_bindgen]
pub struct Task {
    id: TaskId,
    priority: u8,
    state: TaskState,
}

#[wasm_bindgen]
pub struct Exec {
    tasks: HashMap<TaskId, Task>,
    next_id: u32,
    current_task: Option<TaskId>,
    message_queues: HashMap<TaskId, Vec<Vec<u8>>>,
}

#[wasm_bindgen]
impl Exec {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Exec {
        Exec {
            tasks: HashMap::new(),
            next_id: 1,
            current_task: None,
            message_queues: HashMap::new(),
        }
    }
    
    pub fn create_task(&mut self, priority: u8) -> TaskId {
        let id = TaskId(self.next_id);
        self.next_id += 1;
        
        let task = Task {
            id,
            priority,
            state: TaskState::Ready,
        };
        
        self.tasks.insert(id, task);
        self.message_queues.insert(id, Vec::new());
        
        id
    }
    
    pub fn send_message(&mut self, to: TaskId, msg: Vec<u8>) -> bool {
        if let Some(queue) = self.message_queues.get_mut(&to) {
            queue.push(msg);
            true
        } else {
            false
        }
    }
    
    pub fn receive_message(&mut self, task: TaskId) -> Option<Vec<u8>> {
        self.message_queues
            .get_mut(&task)
            .and_then(|queue| {
                if queue.is_empty() {
                    None
                } else {
                    Some(queue.remove(0))
                }
            })
    }
    
    pub fn schedule(&mut self) -> Option<TaskId> {
        // Simple priority-based scheduling
        self.tasks
            .values()
            .filter(|t| t.state == TaskState::Ready)
            .max_by_key(|t| t.priority)
            .map(|t| t.id)
    }
    
    pub fn terminate_task(&mut self, id: TaskId) {
        if let Some(task) = self.tasks.get_mut(&id) {
            task.state = TaskState::Terminated;
        }
        self.message_queues.remove(&id);
    }
}
```

### 3. Intuition Engine (TypeScript)

Lightweight GUI framework with NecroNet styling.

```typescript
// intuition/window.ts
import { GraphicsContext, Rect, Point, Color } from '../pal/graphics';
import { NecroTheme } from './theme';

export class Window {
  title: string;
  bounds: Rect;
  widgets: Widget[];
  focused: boolean = false;
  
  constructor(title: string, bounds: Rect) {
    this.title = title;
    this.bounds = bounds;
    this.widgets = [];
  }
  
  addWidget(widget: Widget): void {
    this.widgets.push(widget);
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw window background
    ctx.drawRect(this.bounds, theme.windowBackground);
    
    // Draw title bar
    const titleBarHeight = 24;
    const titleBar: Rect = {
      x: this.bounds.x,
      y: this.bounds.y,
      width: this.bounds.width,
      height: titleBarHeight,
    };
    
    ctx.drawRect(titleBar, this.focused ? theme.accentGlow : theme.shadow);
    
    // Draw title text
    ctx.drawText(
      this.title,
      { x: this.bounds.x + 8, y: this.bounds.y + 16 },
      theme.font,
      theme.text
    );
    
    // Draw border
    this.drawBorder(ctx, this.bounds, theme.shadow);
    
    // Render widgets
    for (const widget of this.widgets) {
      widget.render(ctx);
    }
  }
  
  private drawBorder(ctx: GraphicsContext, rect: Rect, color: Color): void {
    // Top
    ctx.drawRect({ x: rect.x, y: rect.y, width: rect.width, height: 1 }, color);
    // Bottom
    ctx.drawRect({ x: rect.x, y: rect.y + rect.height - 1, width: rect.width, height: 1 }, color);
    // Left
    ctx.drawRect({ x: rect.x, y: rect.y, width: 1, height: rect.height }, color);
    // Right
    ctx.drawRect({ x: rect.x + rect.width - 1, y: rect.y, width: 1, height: rect.height }, color);
  }
  
  handleEvent(event: InputEvent): boolean {
    // Check if event is within window bounds
    if (!this.containsPoint(event.position)) {
      return false;
    }
    
    // Propagate to widgets
    for (const widget of this.widgets) {
      if (widget.handleEvent(event)) {
        return true;
      }
    }
    
    return true;
  }
  
  private containsPoint(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y < this.bounds.y + this.bounds.height;
  }
}

export abstract class Widget {
  bounds: Rect;
  
  constructor(bounds: Rect) {
    this.bounds = bounds;
  }
  
  abstract render(ctx: GraphicsContext): void;
  abstract handleEvent(event: InputEvent): boolean;
}

export class Button extends Widget {
  label: string;
  onClick: () => void;
  hovered: boolean = false;
  
  constructor(bounds: Rect, label: string, onClick: () => void) {
    super(bounds);
    this.label = label;
    this.onClick = onClick;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    const bgColor = this.hovered ? theme.accentGlow : theme.shadow;
    
    ctx.drawRect(this.bounds, bgColor);
    
    // Center text
    const textX = this.bounds.x + (this.bounds.width / 2) - (this.label.length * 4);
    const textY = this.bounds.y + (this.bounds.height / 2) + 4;
    
    ctx.drawText(this.label, { x: textX, y: textY }, theme.font, theme.text);
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'mousemove') {
      this.hovered = this.containsPoint(event.position);
      return false;
    }
    
    if (event.type === 'click' && this.containsPoint(event.position)) {
      this.onClick();
      return true;
    }
    
    return false;
  }
  
  private containsPoint(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y < this.bounds.y + this.bounds.height;
  }
}
```

```typescript
// intuition/theme.ts
export interface Theme {
  background: Color;
  shadow: Color;
  accentGlow: Color;
  highlight: Color;
  warning: Color;
  text: Color;
  textDim: Color;
  windowBackground: Color;
  font: Font;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Font {
  family: string;
  size: number;
}

export const NecroTheme: Theme = {
  background: { r: 10, g: 6, b: 18 },        // #0a0612
  shadow: { r: 28, g: 16, b: 36 },           // #1c1024
  accentGlow: { r: 168, g: 85, b: 247 },     // #a855f7
  highlight: { r: 0, g: 255, b: 247 },       // #00fff7
  warning: { r: 255, g: 0, b: 110 },         // #ff006e
  text: { r: 245, g: 245, b: 245 },          // #f5f5f5
  textDim: { r: 153, g: 153, b: 153 },       // #999999
  windowBackground: { r: 20, g: 12, b: 28 }, // Slightly lighter than background
  font: { family: 'Orbitron, monospace', size: 12 },
};
```

### 4. Workbench Shell (TypeScript)

Desktop environment with icon management.

```typescript
// workbench/desktop.ts
import { Window } from '../intuition/window';
import { GraphicsContext, Point, Rect } from '../pal/graphics';
import { NecroTheme } from '../intuition/theme';

export interface Icon {
  label: string;
  image: ImageData | null;
  position: Point;
  target: string; // Application ID or file path
}

export class Desktop {
  icons: Icon[] = [];
  windows: Window[] = [];
  dragState: { icon: Icon; offset: Point } | null = null;
  
  addIcon(icon: Icon): void {
    this.icons.push(icon);
    this.saveLayout();
  }
  
  openWindow(window: Window): void {
    this.windows.push(window);
    window.focused = true;
    
    // Unfocus other windows
    for (const w of this.windows) {
      if (w !== window) {
        w.focused = false;
      }
    }
  }
  
  render(ctx: GraphicsContext): void {
    // Clear background
    ctx.clear(NecroTheme.background);
    
    // Render icons
    for (const icon of this.icons) {
      this.renderIcon(ctx, icon);
    }
    
    // Render windows (back to front)
    for (const window of this.windows) {
      window.render(ctx);
    }
  }
  
  private renderIcon(ctx: GraphicsContext, icon: Icon): void {
    const iconSize = 48;
    const bounds: Rect = {
      x: icon.position.x,
      y: icon.position.y,
      width: iconSize,
      height: iconSize,
    };
    
    // Draw icon background
    ctx.drawRect(bounds, NecroTheme.shadow);
    
    // Draw icon image if available
    if (icon.image) {
      ctx.drawImage(icon.image, icon.position);
    }
    
    // Draw label below icon
    const labelY = icon.position.y + iconSize + 12;
    ctx.drawText(icon.label, { x: icon.position.x, y: labelY }, NecroTheme.font, NecroTheme.text);
  }
  
  handleDoubleClick(pos: Point): void {
    // Check if clicked on an icon
    for (const icon of this.icons) {
      if (this.iconContainsPoint(icon, pos)) {
        this.launchIcon(icon);
        return;
      }
    }
  }
  
  private iconContainsPoint(icon: Icon, point: Point): boolean {
    const iconSize = 48;
    return point.x >= icon.position.x &&
           point.x < icon.position.x + iconSize &&
           point.y >= icon.position.y &&
           point.y < icon.position.y + iconSize;
  }
  
  private launchIcon(icon: Icon): void {
    // Application launching logic
    console.log(`Launching: ${icon.target}`);
  }
  
  private saveLayout(): void {
    const layout = this.icons.map(icon => ({
      label: icon.label,
      position: icon.position,
      target: icon.target,
    }));
    localStorage.setItem('amiron-desktop-layout', JSON.stringify(layout));
  }
  
  loadLayout(): void {
    const saved = localStorage.getItem('amiron-desktop-layout');
    if (saved) {
      const layout = JSON.parse(saved);
      this.icons = layout.map((item: any) => ({
        label: item.label,
        image: null, // Load images separately
        position: item.position,
        target: item.target,
      }));
    }
  }
}
```

### 5. Ritual API (Public Interface)

Clean API for application developers.

```typescript
// ritual-api/index.ts
import { Exec, TaskId } from '../exec/pkg';
import { Window, Widget } from '../intuition/window';
import { FileSystem } from '../pal/storage';

let execInstance: Exec;
let fileSystemInstance: FileSystem;

export namespace Amiron {
  export function init(exec: Exec, fs: FileSystem): void {
    execInstance = exec;
    fileSystemInstance = fs;
  }
  
  // Task Management
  export function createTask(priority: number): TaskId {
    return execInstance.create_task(priority);
  }
  
  export function sendMessage(task: TaskId, data: Uint8Array): void {
    execInstance.send_message(task, Array.from(data));
  }
  
  export function receiveMessage(task: TaskId): Uint8Array | null {
    const msg = execInstance.receive_message(task);
    return msg ? new Uint8Array(msg) : null;
  }
  
  // Window Management
  export function createWindow(title: string, x: number, y: number, width: number, height: number): Window {
    return new Window(title, { x, y, width, height });
  }
  
  export function addWidget(window: Window, widget: Widget): void {
    window.addWidget(widget);
  }
  
  // File Operations
  export async function readFile(path: string): Promise<Uint8Array> {
    return await fileSystemInstance.readFile(path);
  }
  
  export async function writeFile(path: string, data: Uint8Array): Promise<void> {
    return await fileSystemInstance.writeFile(path, data);
  }
  
  export async function listDirectory(path: string): Promise<FileEntry[]> {
    return await fileSystemInstance.listDir(path);
  }
}
```

## Data Models

### File System Structure

```typescript
interface FileEntry {
  name: string;
  type: 'file' | 'directory' | 'application';
  size: number;
  created: Date;
  modified: Date;
}

interface FileData {
  path: string;
  data: Uint8Array;
  metadata: FileEntry;
}
```

### Input Events

```typescript
interface InputEvent {
  type: 'click' | 'mousemove' | 'mousedown' | 'mouseup' | 'keydown' | 'keyup';
  position: Point;
  button?: number;
  key?: string;
}
```

## Error Handling

### Error Categories

1. **Task Errors**: Invalid task ID, scheduling failures
2. **Graphics Errors**: Canvas initialization failure, rendering errors
3. **File System Errors**: File not found, quota exceeded
4. **Audio Errors**: Context creation failure

### Error Propagation Strategy

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Example usage
async function readFile(path: string): Promise<Result<Uint8Array>> {
  try {
    const data = await fileSystemInstance.readFile(path);
    return { ok: true, value: data };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}
```

## Testing Strategy

### Unit Tests

- **Exec Layer**: Task scheduling, message passing (Rust tests with wasm-bindgen-test)
- **Intuition Engine**: Widget rendering, event handling (Jest + Testing Library)
- **File System**: CRUD operations (Jest with fake IndexedDB)

### Integration Tests

- **Window Management**: Create window, add widgets, handle events (Playwright)
- **Desktop Operations**: Icon drag-drop, application launching (Playwright)

### Performance Tests

- **Frame Rate**: Maintain 60 FPS with 5 windows open
- **Load Time**: Initial load under 3 seconds
- **File Operations**: Read/write 1MB file under 100ms

## Visual Design System

### Color Palette (NecroNet Dark Theme)

```typescript
export const Colors = {
  Background: '#0a0612',    // Deep void purple
  Shadow: '#1c1024',        // Dark purple for borders/shadows
  AccentGlow: '#a855f7',    // Violet for highlights/active elements
  Highlight: '#00fff7',     // Cyan for secondary highlights
  Warning: '#ff006e',       // Hot pink for alerts/errors
  Text: '#f5f5f5',          // Off-white for text
  TextDim: '#999999',       // Dimmed text for secondary info
};
```

### Typography

- **Primary Font**: Orbitron (matching NecroNet)
- **Monospace**: Space Grotesk or system monospace for terminal
- **Size**: 12px base, 14px for titles

### Icon Style

- **Size**: 48x48 pixels
- **Style**: Minimalist line art with NecroNet colors
- **Format**: SVG or PNG with transparency

### Window Chrome

```
┌─────────────────────────────┐
│ Window Title            ☒   │ ← Title bar (purple glow)
├─────────────────────────────┤
│                             │
│   Window Content Area       │ ← Content (dark purple)
│                             │
└─────────────────────────────┘
```

## Performance Optimizations

### Rendering

- **Dirty Rectangle Tracking**: Only redraw changed regions
- **Request Animation Frame**: Sync with browser refresh rate
- **Offscreen Canvas**: Pre-render static elements

### Memory Management

- **Object Pooling**: Reuse event objects
- **Lazy Loading**: Load applications on demand

### WebAssembly Optimization

- **Minimal WASM Size**: Strip debug symbols in production
- **Streaming Compilation**: Load WASM progressively

## Deployment Architecture

### Web Hosting

```
amiron/
├── index.html          # Entry point
├── assets/
│   ├── amiron_exec.wasm    # Exec layer (Rust compiled)
│   ├── bundle.js           # TypeScript compiled
│   └── icons/              # System icons
└── apps/                   # Bundled applications
    ├── text-editor.js
    ├── file-manager.js
    └── terminal.js
```

### Integration with NecroPlay

```typescript
// necroplay integration
export const AmironApp = {
  id: 'amiron-desktop',
  name: 'Amiron Desktop',
  type: 'system',
  description: 'AmigaOS-inspired desktop environment',
  thumbnail: '/assets/amiron-icon.png',
  launch: () => {
    window.open('/amiron/', '_blank', 'width=1024,height=768');
  },
};
```

## Development Workflow

### Project Structure

```
amiron/
├── packages/
│   ├── exec/              # Rust WASM (task manager)
│   ├── intuition/         # TypeScript (GUI framework)
│   ├── workbench/         # TypeScript (desktop shell)
│   ├── ritual-api/        # TypeScript (public API)
│   └── pal/               # TypeScript (platform abstraction)
├── apps/
│   ├── text-editor/       # Core application
│   ├── file-manager/      # Core application
│   └── terminal/          # Core application
├── web/                   # Web entry point
│   ├── index.html
│   └── main.ts
└── docs/                  # Documentation
```

### Build Process

1. **Compile Rust**: `wasm-pack build packages/exec --target web`
2. **Compile TypeScript**: `tsc -b packages/`
3. **Bundle Web**: `vite build web/`
4. **Run Dev Server**: `vite dev web/`
