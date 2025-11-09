# Graveyard Runtime

Runtime engine for executing legacy file formats in modern browsers.

## Features

- **SWF Engine**: Execute Shockwave Flash files with ActionScript support
- **JVM Interpreter**: Execute Java bytecode
- **ActionScript Interpreter**: Execute ActionScript v1.0
- **Lingo Interpreter**: Execute Lingo scripts for Director files
- **XAML Parser**: Parse and render Silverlight XAML files
- **Audio Manager**: Play MP3 and ADPCM audio
- **Network Client**: HTTP requests and file operations
- **Storage Manager**: SharedObject and LocalStorage support
- **Performance Monitor**: FPS tracking and performance metrics
- **Error Recovery**: Graceful degradation and retry mechanisms
- **Memory Manager**: Resource pooling and memory management
- **Render Cache**: Shape caching and dirty rectangle tracking

## Installation

```bash
pnpm install @necroverse/graveyard-runtime
```

## Usage

### SWF Playback

```typescript
import { SWFEngine } from "@necroverse/graveyard-runtime";
import { CanvasRenderer } from "@necroverse/graveyard-runtime";
import { parseSWF } from "@necroverse/graveyard-runtime";

const swfFile = await parseSWF(arrayBuffer);
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas, 800, 600);
const engine = new SWFEngine(swfFile, renderer);

engine.play();
```

### JVM Execution

```typescript
import { JVMInterpreter } from "@necroverse/graveyard-runtime";
import { JavaClassParser } from "@necroverse/graveyard-runtime";

const parser = new JavaClassParser(arrayBuffer);
const classFile = parser.parse();
const interpreter = new JVMInterpreter();

interpreter.loadClass("MyClass", classFile);
const result = interpreter.executeMethod("MyClass", "main", []);
```

## API Reference

See [API Documentation](../../docs/api/README.md) for full API reference.

## Examples

See [Code Examples](../../docs/examples/README.md) for usage examples.

## License

MIT

