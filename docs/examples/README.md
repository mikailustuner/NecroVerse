# Code Examples

## Basic SWF Playback

```typescript
import { SWFEngine } from "@graveyard-runtime/engines";
import { CanvasRenderer } from "@graveyard-runtime/renderers";
import { parseSWF } from "@graveyard-runtime/parsers";

async function playSWF(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const swfFile = await parseSWF(arrayBuffer);
  
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = new CanvasRenderer(canvas, 800, 600);
  const engine = new SWFEngine(swfFile, renderer);
  
  engine.play();
  
  // Render loop
  const renderLoop = () => {
    engine.render();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();
}
```

## JVM Bytecode Execution

```typescript
import { JVMInterpreter } from "@graveyard-runtime/engines";
import { JavaClassParser } from "@graveyard-runtime/parsers";

async function executeJava(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const parser = new JavaClassParser(arrayBuffer);
  const classFile = parser.parse();
  
  const interpreter = new JVMInterpreter();
  interpreter.loadClass("MyClass", classFile);
  
  try {
    const result = interpreter.executeMethod("MyClass", "main", []);
    console.log("Result:", result);
  } catch (error) {
    console.error("Execution error:", error);
  }
}
```

## ActionScript Execution

```typescript
import { ActionScriptInterpreter } from "@graveyard-runtime/engines";

const context = {
  variables: {},
  functions: {},
  registers: {},
  withScopes: [],
  timeline: {
    currentFrame: 0,
    totalFrames: 10,
    gotoFrame: (frame) => console.log("Go to frame", frame),
    play: () => console.log("Play"),
    stop: () => console.log("Stop"),
  },
};

const interpreter = new ActionScriptInterpreter(context);
interpreter.execute(bytecode);
```

## Audio Playback

```typescript
import { AudioManager } from "@graveyard-runtime/engines";

const audioManager = new AudioManager();

// Load MP3 audio
await audioManager.loadMP3(1, mp3Data);

// Play sound
audioManager.playSound(1, false, 1.0, 0.0);

// Control volume
audioManager.setMasterVolume(0.5);
audioManager.setMuted(false);
```

## Network Operations

```typescript
import { NetworkClient } from "@graveyard-runtime/utils";

const client = new NetworkClient();

// Load variables
const variables = await client.loadVariables("https://example.com/data.txt");

// Load movie
const movieData = await client.loadMovie("https://example.com/movie.swf");

// Download file
await client.downloadFile("https://example.com/file.swf", "file.swf");
```

## SharedObject Usage

```typescript
import { SharedObjectManager } from "@graveyard-runtime/utils";

// Get or create SharedObject
const sharedObject = SharedObjectManager.getLocal("myData");

// Store data
sharedObject.data.value = 42;
sharedObject.data.name = "Test";

// Flush to localStorage
sharedObject.flush();

// Clear data
sharedObject.clear();
```

## Performance Monitoring

```typescript
import { PerformanceMonitor } from "@graveyard-runtime/utils";

const monitor = new PerformanceMonitor();

// In render loop
const renderLoop = () => {
  monitor.startFrame();
  monitor.startRender();
  
  // Rendering code
  engine.render();
  
  monitor.endRender();
  monitor.endFrame();
  
  // Get metrics
  const metrics = monitor.getCurrentMetrics();
  console.log("FPS:", metrics.fps);
  console.log("Frame Time:", metrics.frameTime);
  console.log("Memory:", metrics.memoryUsage);
  
  requestAnimationFrame(renderLoop);
};
```

## Error Recovery

```typescript
import { ErrorRecoveryManager } from "@graveyard-runtime/utils";

const recovery = new ErrorRecoveryManager();

// Recover from error with fallback
const result = await recovery.recover(
  async () => {
    // Risky operation
    return await riskyFunction();
  },
  () => {
    // Fallback
    return defaultValue;
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
);
```

## Memory Management

```typescript
import { MemoryManager } from "@graveyard-runtime/utils";

const memory = new MemoryManager();

// Register resource
memory.registerResource("shape1", "shape", shapeData);

// Get resource
const resource = memory.getResource("shape1");

// Release resource
memory.releaseResource("shape1");

// Get statistics
const stats = memory.getStats();
console.log("Active Resources:", stats.activeResources);
console.log("Memory Usage:", stats.memoryUsage);
```

## Render Caching

```typescript
import { RenderCacheManager } from "@graveyard-runtime/utils";

const cache = new RenderCacheManager();

// Get cached shape
const cachedCanvas = cache.getCachedShape(
  shapeId,
  shape,
  (shape, canvas) => {
    // Render shape to canvas
    renderShape(shape, canvas);
  }
);

// Add dirty rectangle
cache.addDirtyRect(x, y, width, height);

// Merge dirty rectangles
const dirtyRects = cache.mergeDirtyRects();

// Get cache statistics
const stats = cache.getStats();
console.log("Cache Hit Rate:", stats.hitRate);
```

