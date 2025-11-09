# Amiron Ritual API Examples

This directory contains example applications demonstrating how to use the Ritual API.

## Examples

### 1. Hello World (`hello-world.ts`)

The simplest possible Amiron application. Creates a window with a button.

**Demonstrates:**
- Creating a window
- Adding a button widget
- Handling button clicks
- Focusing windows

**Run:**
```typescript
import { helloWorld } from './examples/hello-world';
await helloWorld();
```

### 2. File Operations (`file-operations.ts`)

Shows how to work with the virtual file system.

**Demonstrates:**
- Writing text files
- Reading files
- Writing binary data
- Listing directory contents
- Error handling with Result types

**Run:**
```typescript
import { fileOperationsDemo } from './examples/file-operations';
await fileOperationsDemo();
```

### 3. Task Messaging (`task-messaging.ts`)

Demonstrates the task management and message passing system.

**Demonstrates:**
- Creating tasks with priorities
- Sending messages between tasks
- Receiving messages from task queues
- Terminating tasks

**Run:**
```typescript
import { taskMessagingDemo } from './examples/task-messaging';
await taskMessagingDemo();
```

### 4. Audio Playback (`audio-playback.ts`)

Shows how to play sounds with volume control.

**Demonstrates:**
- Checking audio availability
- Loading audio files
- Playing sounds at different volumes
- Error handling with Result types
- Generating audio programmatically

**Run:**
```typescript
import { audioPlaybackDemo, generateBeep } from './examples/audio-playback';
await audioPlaybackDemo();

// Or generate a beep
const beepBuffer = generateBeep(440, 0.2);
await Amiron.playSound(beepBuffer);
```

## Running Examples

To run these examples in your Amiron application:

1. Initialize the Amiron system:
```typescript
import { Amiron } from '@amiron/ritual-api';
import { Exec } from '@amiron/exec';
import { IndexedDBFileSystem, WebAudioContext } from '@amiron/pal';

const exec = new Exec();
const fs = new IndexedDBFileSystem();
await fs.init();
const audio = new WebAudioContext();

Amiron.init(exec, fs, audio);
```

2. Import and run any example:
```typescript
import { helloWorld } from '@amiron/ritual-api/examples/hello-world';
const window = await helloWorld();
```

## Building Your Own Application

Use these examples as templates for your own applications. The typical structure is:

```typescript
import { Amiron } from '@amiron/ritual-api';
import { Button, Label, TextField } from '@amiron/intuition';

export async function myApp() {
  // Create window
  const window = Amiron.createWindow("My App", 100, 100, 400, 300);
  
  // Add widgets
  const button = new Button(
    { x: 10, y: 10, width: 100, height: 30 },
    "Click",
    () => console.log("Clicked!")
  );
  Amiron.addWidget(window, button);
  
  // Focus window
  Amiron.focusWindow(window);
  
  return window;
}
```

## Next Steps

- Read the [API Reference](../README.md) for complete documentation
- Explore the [Intuition widgets](../../amiron-intuition/README.md) for UI components
- Check the [PAL documentation](../../amiron-pal/README.md) for platform abstractions
- Learn about [Exec layer](../../amiron-exec/README.md) for task management
