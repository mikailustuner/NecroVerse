# API Reference

## Graveyard Runtime API

### Core Classes

#### `SWFEngine`
Main engine for executing SWF files.

```typescript
import { SWFEngine } from "@graveyard-runtime/engines";
import { CanvasRenderer } from "@graveyard-runtime/renderers";
import { parseSWF } from "@graveyard-runtime/parsers";

const swfFile = await parseSWF(arrayBuffer);
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas, 800, 600);
const engine = new SWFEngine(swfFile, renderer);

engine.play();
engine.render();
```

#### `JVMInterpreter`
Java Virtual Machine interpreter for executing Java bytecode.

```typescript
import { JVMInterpreter } from "@graveyard-runtime/engines";
import { JavaClassParser } from "@graveyard-runtime/parsers";

const parser = new JavaClassParser(arrayBuffer);
const classFile = parser.parse();
const interpreter = new JVMInterpreter();

interpreter.loadClass("MyClass", classFile);
const result = interpreter.executeMethod("MyClass", "main", []);
```

#### `ActionScriptInterpreter`
ActionScript v1.0 interpreter.

```typescript
import { ActionScriptInterpreter } from "@graveyard-runtime/engines";

const context = {
  variables: {},
  functions: {},
  timeline: {
    currentFrame: 0,
    totalFrames: 10,
    gotoFrame: (frame) => {},
    play: () => {},
    stop: () => {},
  },
};

const interpreter = new ActionScriptInterpreter(context);
interpreter.execute(bytecode);
```

#### `LingoInterpreter`
Lingo interpreter for Director files.

```typescript
import { LingoInterpreter } from "@graveyard-runtime/engines";

const context = {
  variables: {},
  functions: {},
  sprites: new Map(),
  stage: { width: 800, height: 600 },
  timeline: {
    currentFrame: 0,
    totalFrames: 10,
    gotoFrame: (frame) => {},
    play: () => {},
    stop: () => {},
  },
};

const interpreter = new LingoInterpreter(context);
interpreter.execute("go 5");
```

#### `XAMLParser`
XAML parser for Silverlight files.

```typescript
import { XAMLParser } from "@graveyard-runtime/engines";

const parser = new XAMLParser();
const xaml = '<Canvas><Rectangle Width="100" Height="100"/></Canvas>';
const element = parser.parse(xaml);
```

### Utilities

#### `AudioManager`
Audio playback manager for SWF files.

```typescript
import { AudioManager } from "@graveyard-runtime/engines";

const audioManager = new AudioManager();
await audioManager.loadMP3(soundId, arrayBuffer);
audioManager.playSound(soundId, false, 1.0, 0.0);
```

#### `NetworkClient`
Network utilities for HTTP requests.

```typescript
import { NetworkClient } from "@graveyard-runtime/utils";

const client = new NetworkClient();
const variables = await client.loadVariables("https://example.com/data.txt");
await client.loadMovie("https://example.com/movie.swf");
```

#### `SharedObjectManager`
SharedObject manager for ActionScript compatibility.

```typescript
import { SharedObjectManager } from "@graveyard-runtime/utils";

const sharedObject = SharedObjectManager.getLocal("myData");
sharedObject.data.value = 42;
sharedObject.flush();
```

#### `PerformanceMonitor`
Performance monitoring utilities.

```typescript
import { PerformanceMonitor } from "@graveyard-runtime/utils";

const monitor = new PerformanceMonitor();
monitor.startFrame();
monitor.startRender();
// ... rendering code ...
monitor.endRender();
monitor.endFrame();

const metrics = monitor.getCurrentMetrics();
const stats = monitor.getStats();
```

#### `ErrorRecoveryManager`
Error recovery utilities.

```typescript
import { ErrorRecoveryManager } from "@graveyard-runtime/utils";

const recovery = new ErrorRecoveryManager();
const result = await recovery.recover(
  async () => {
    // Risky operation
    return await riskyFunction();
  },
  () => {
    // Fallback
    return defaultValue;
  }
);
```

#### `MemoryManager`
Memory management utilities.

```typescript
import { MemoryManager } from "@graveyard-runtime/utils";

const memory = new MemoryManager();
memory.registerResource("shape1", "shape", shapeData);
const resource = memory.getResource("shape1");
memory.releaseResource("shape1");
```

#### `RenderCacheManager`
Render caching utilities.

```typescript
import { RenderCacheManager } from "@graveyard-runtime/utils";

const cache = new RenderCacheManager();
const cachedCanvas = cache.getCachedShape(shapeId, shape, renderCallback);
cache.addDirtyRect(x, y, width, height);
const dirtyRects = cache.mergeDirtyRects();
```

### Parsers

#### `parseSWF`
Parse SWF file format.

```typescript
import { parseSWF } from "@graveyard-runtime/parsers";

const swfFile = await parseSWF(arrayBuffer);
console.log(swfFile.header.frameCount);
console.log(swfFile.tags.length);
```

#### `parseJAR`
Parse JAR file format.

```typescript
import { parseJAR } from "@graveyard-runtime/parsers";

const jarFile = await parseJAR(arrayBuffer);
console.log(jarFile.manifest);
console.log(jarFile.classes.length);
```

#### `parseXAP`
Parse XAP file format.

```typescript
import { parseXAP } from "@graveyard-runtime/parsers";

const xapFile = await parseXAP(arrayBuffer);
console.log(xapFile.manifest);
console.log(xapFile.files.size);
```

#### `parseDCR`
Parse DCR file format.

```typescript
import { parseDCR } from "@graveyard-runtime/parsers";

const dcrFile = await parseDCR(arrayBuffer);
console.log(dcrFile.header);
console.log(dcrFile.frames.length);
```

### Converters

#### `convertFile`
Convert legacy file format.

```typescript
import { convertFile } from "@graveyard-runtime/converters";

const result = await convertFile(file, uploadUrl);
if (result.success) {
  console.log(result.metadata);
  console.log(result.outputUrl);
}
```

#### `exportToModernFormat`
Export to modern format (WebAssembly or WebGL).

```typescript
import { exportToModernFormat } from "@graveyard-runtime/converters";

const result = await exportToModernFormat(file, uploadUrl, "wasm");
if (result.success) {
  console.log(result.metadata);
}
```

