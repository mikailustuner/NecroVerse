# Amiron Ritual API

The Ritual API is the public interface for building applications on the Amiron platform. It provides clean, well-documented functions for task management, window creation, file operations, and audio playback.

## Installation

```bash
npm install @amiron/ritual-api
```

## Quick Start

```typescript
import { Amiron } from '@amiron/ritual-api';
import { Exec } from '@amiron/exec';
import { IndexedDBFileSystem, WebAudioContext } from '@amiron/pal';

// Initialize the system
const exec = new Exec();
const fs = new IndexedDBFileSystem();
await fs.init();
const audio = new WebAudioContext();

Amiron.init(exec, fs, audio);

// Create a window
const window = Amiron.createWindow("My App", 100, 100, 400, 300);

// Create a task
const taskId = Amiron.createTask(10);

// Read a file
const data = await Amiron.readFile("/documents/note.txt");
```

## API Reference

### Initialization

#### `Amiron.init(exec, fs, audio?)`

Initialize the Amiron system with core subsystems.

**Parameters:**
- `exec: Exec` - The Exec layer instance for task management
- `fs: FileSystem` - The FileSystem instance for storage operations
- `audio?: IAudioContext` - Optional audio context for sound playback

**Example:**
```typescript
Amiron.init(exec, fileSystem, audioContext);
```

---

### Task Management

#### `Amiron.createTask(priority)`

Create a new task with specified priority.

**Parameters:**
- `priority: number` - Task priority (0-255, higher values = higher priority)

**Returns:** `TaskId` - Task identifier for message passing

**Example:**
```typescript
const taskId = Amiron.createTask(10);
```

#### `Amiron.sendMessage(task, data)`

Send a message to a task.

**Parameters:**
- `task: TaskId` - Target task ID
- `data: Uint8Array` - Message data as byte array

**Example:**
```typescript
const message = new TextEncoder().encode("Hello");
Amiron.sendMessage(taskId, message);
```

#### `Amiron.receiveMessage(task)`

Receive a message from a task's queue.

**Parameters:**
- `task: TaskId` - Task ID to receive from

**Returns:** `Uint8Array | null` - Message data or null if queue is empty

**Example:**
```typescript
const message = Amiron.receiveMessage(taskId);
if (message) {
  const text = new TextDecoder().decode(message);
  console.log("Received:", text);
}
```

#### `Amiron.terminateTask(task)`

Terminate a task and clean up its resources.

**Parameters:**
- `task: TaskId` - Task ID to terminate

---

### Window Management

#### `Amiron.createWindow(title, x, y, width, height)`

Create a new window.

**Parameters:**
- `title: string` - Window title displayed in title bar
- `x: number` - X position on screen
- `y: number` - Y position on screen
- `width: number` - Window width in pixels
- `height: number` - Window height in pixels

**Returns:** `Window` - Window instance

**Example:**
```typescript
const window = Amiron.createWindow("My App", 100, 100, 400, 300);
```

#### `Amiron.addWidget(window, widget)`

Add a widget to a window.

**Parameters:**
- `window: Window` - Target window
- `widget: Widget` - Widget to add

**Example:**
```typescript
import { Button } from '@amiron/intuition';

const button = new Button(
  { x: 10, y: 10, width: 100, height: 30 },
  "Click Me",
  () => console.log("Clicked!")
);
Amiron.addWidget(window, button);
```

#### `Amiron.focusWindow(window)`

Focus a window, bringing it to the front.

**Parameters:**
- `window: Window` - Window to focus

#### `Amiron.closeWindow(window)`

Close a window (marks as unfocused).

**Parameters:**
- `window: Window` - Window to close

---

### File System

#### `Amiron.readFile(path)`

Read a file from the virtual file system.

**Parameters:**
- `path: string` - File path to read

**Returns:** `Promise<Uint8Array>` - File data

**Throws:** `Error` if file not found or read fails

**Example:**
```typescript
const data = await Amiron.readFile("/documents/note.txt");
const text = new TextDecoder().decode(data);
console.log(text);
```

#### `Amiron.readFileSafe(path)`

Read a file with Result type for error handling.

**Parameters:**
- `path: string` - File path to read

**Returns:** `Promise<Result<Uint8Array>>` - Result containing file data or error

**Example:**
```typescript
const result = await Amiron.readFileSafe("/documents/note.txt");
if (result.ok) {
  console.log("File data:", result.value);
} else {
  console.error("Error:", result.error.message);
}
```

#### `Amiron.writeFile(path, data)`

Write data to a file in the virtual file system.

**Parameters:**
- `path: string` - File path to write
- `data: Uint8Array` - Data to write

**Returns:** `Promise<void>`

**Example:**
```typescript
const data = new TextEncoder().encode("Hello, world!");
await Amiron.writeFile("/documents/note.txt", data);
```

#### `Amiron.writeFileSafe(path, data)`

Write data to a file with Result type for error handling.

**Parameters:**
- `path: string` - File path to write
- `data: Uint8Array` - Data to write

**Returns:** `Promise<Result<void>>` - Result indicating success or error

#### `Amiron.listDirectory(path)`

List files and directories at a path.

**Parameters:**
- `path: string` - Directory path to list

**Returns:** `Promise<FileEntry[]>` - Array of file entries

**Example:**
```typescript
const entries = await Amiron.listDirectory("/documents");
entries.forEach(entry => {
  console.log(`${entry.name} (${entry.type}) - ${entry.size} bytes`);
});
```

#### `Amiron.createDirectory(path)`

Create a directory in the virtual file system.

**Parameters:**
- `path: string` - Directory path to create

**Returns:** `Promise<void>`

#### `Amiron.deleteFile(path)`

Delete a file from the virtual file system.

**Parameters:**
- `path: string` - File path to delete

**Returns:** `Promise<void>`

---

### Audio

#### `Amiron.playSound(buffer, volume?)`

Play a sound from an audio buffer.

**Parameters:**
- `buffer: ArrayBuffer` - Audio data as ArrayBuffer
- `volume?: number` - Volume level (0.0 to 1.0), defaults to 1.0

**Returns:** `Promise<void>`

**Throws:** `Error` if audio context not initialized or playback fails

**Example:**
```typescript
const audioData = await fetch("/sounds/beep.wav").then(r => r.arrayBuffer());
await Amiron.playSound(audioData, 0.5);
```

#### `Amiron.playSoundSafe(buffer, volume?)`

Play a sound with Result type for error handling.

**Parameters:**
- `buffer: ArrayBuffer` - Audio data as ArrayBuffer
- `volume?: number` - Volume level (0.0 to 1.0), defaults to 1.0

**Returns:** `Promise<Result<void>>` - Result indicating success or error

#### `Amiron.hasAudio()`

Check if audio context is available.

**Returns:** `boolean` - true if audio context is initialized

---

## Types

### Result<T, E>

A discriminated union type for operations that may fail:

```typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };
```

**Usage:**
```typescript
const result = await Amiron.readFileSafe("/path/to/file");
if (result.ok) {
  // Success case
  processData(result.value);
} else {
  // Error case
  console.error(result.error.message);
}
```

### FileEntry

Represents a file or directory entry:

```typescript
interface FileEntry {
  name: string;
  type: 'file' | 'directory' | 'application';
  size: number;
  created: Date;
  modified: Date;
}
```

---

## Examples

See the [examples directory](./examples) for complete sample applications:

- **Hello World** - Minimal window with a button
- **Text Editor** - Simple text editing application
- **File Browser** - Navigate and manage files
- **Audio Player** - Play sound effects

## TypeScript Support

The Ritual API includes full TypeScript type definitions. Your IDE will provide autocomplete and type checking automatically.

```typescript
import { Amiron, Window, Widget } from '@amiron/ritual-api';

// Full type safety
const window: Window = Amiron.createWindow("App", 0, 0, 400, 300);
```

## License

MIT
