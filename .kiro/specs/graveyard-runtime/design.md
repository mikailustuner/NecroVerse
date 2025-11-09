# Graveyard Runtime Design Document

## Overview

Graveyard Runtime is the core conversion engine that parses legacy file formats and executes them in modern browsers. It includes specialized interpreters for SWF, JAR, XAP, and DCR files, along with parsers for Windows executables. The runtime provides canvas rendering, audio playback, and WebAssembly compilation capabilities.

## Architecture

```
packages/graveyard-runtime/
├── src/
│   ├── parsers/
│   │   ├── SWFParser.ts
│   │   ├── JARParser.ts
│   │   ├── XAPParser.ts
│   │   ├── DCRParser.ts
│   │   └── PEParser.ts
│   ├── interpreters/
│   │   ├── ActionScriptInterpreter.ts
│   │   ├── JVMInterpreter.ts
│   │   ├── XAMLRenderer.ts
│   │   └── LingoInterpreter.ts
│   ├── renderers/
│   │   ├── CanvasRenderer.ts
│   │   └── WebGLRenderer.ts
│   ├── audio/
│   │   └── AudioEngine.ts
│   ├── compiler/
│   │   └── WASMCompiler.ts
│   └── index.ts
```

## Parsers

### SWF Parser

```typescript
export class SWFParser {
  async parse(buffer: ArrayBuffer): Promise<SWFData> {
    const view = new DataView(buffer);
    
    // Read header
    const signature = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
    const version = view.getUint8(3);
    const fileLength = view.getUint32(4, true);
    
    // Decompress if needed
    let data: Uint8Array;
    if (signature === 'CWS') {
      data = await this.decompressZLIB(new Uint8Array(buffer, 8));
    } else {
      data = new Uint8Array(buffer, 8);
    }
    
    // Parse frame rate and frame count
    const reader = new BitReader(data);
    const frameSize = this.readRect(reader);
    const frameRate = reader.readUInt16() / 256;
    const frameCount = reader.readUInt16();
    
    // Parse tags
    const tags = this.parseTags(reader);
    
    return {
      version,
      frameRate,
      frameCount,
      frameSize,
      tags,
      assets: this.extractAssets(tags)
    };
  }
  
  private parseTags(reader: BitReader): SWFTag[] {
    const tags: SWFTag[] = [];
    
    while (reader.hasMore()) {
      const tagCodeAndLength = reader.readUInt16();
      const tagCode = tagCodeAndLength >> 6;
      let length = tagCodeAndLength & 0x3F;
      
      if (length === 0x3F) {
        length = reader.readUInt32();
      }
      
      const tagData = reader.readBytes(length);
      
      switch (tagCode) {
        case 12: // DoAction
          tags.push(this.parseDoAction(tagData));
          break;
        case 39: // DefineSprite
          tags.push(this.parseDefineSprite(tagData));
          break;
        case 2: // DefineShape
          tags.push(this.parseDefineShape(tagData));
          break;
        case 14: // DefineSound
          tags.push(this.parseDefineSound(tagData));
          break;
      }
    }
    
    return tags;
  }
  
  private parseDoAction(data: Uint8Array): DoActionTag {
    const reader = new BitReader(data);
    const actions: ActionScriptAction[] = [];
    
    while (reader.hasMore()) {
      const actionCode = reader.readUInt8();
      if (actionCode === 0) break; // End of actions
      
      let length = 0;
      if (actionCode >= 0x80) {
        length = reader.readUInt16();
      }
      
      const actionData = length > 0 ? reader.readBytes(length) : new Uint8Array(0);
      
      actions.push({
        code: actionCode,
        data: actionData
      });
    }
    
    return {
      type: 'DoAction',
      actions
    };
  }
}
```

### JAR Parser

```typescript
export class JARParser {
  async parse(buffer: ArrayBuffer): Promise<JARData> {
    const zip = await JSZip.loadAsync(buffer);
    const classes: ClassFile[] = [];
    const manifest = await this.parseManifest(zip);
    
    // Find all .class files
    const classFiles = Object.keys(zip.files).filter(name => name.endsWith('.class'));
    
    for (const filename of classFiles) {
      const classData = await zip.file(filename)!.async('arraybuffer');
      const classFile = await this.parseClassFile(classData);
      classes.push(classFile);
    }
    
    // Identify main class
    const mainClass = manifest.mainClass || this.findMainClass(classes);
    
    return {
      classes,
      mainClass,
      manifest,
      dependencies: this.buildDependencyGraph(classes)
    };
  }
  
  private async parseClassFile(buffer: ArrayBuffer): Promise<ClassFile> {
    const view = new DataView(buffer);
    let offset = 0;
    
    // Magic number
    const magic = view.getUint32(offset);
    if (magic !== 0xCAFEBABE) {
      throw new Error('Invalid class file');
    }
    offset += 4;
    
    // Version
    const minorVersion = view.getUint16(offset);
    offset += 2;
    const majorVersion = view.getUint16(offset);
    offset += 2;
    
    // Constant pool
    const constantPoolCount = view.getUint16(offset);
    offset += 2;
    const constantPool = this.parseConstantPool(view, offset, constantPoolCount);
    offset = constantPool.nextOffset;
    
    // Access flags
    const accessFlags = view.getUint16(offset);
    offset += 2;
    
    // This class
    const thisClass = view.getUint16(offset);
    offset += 2;
    
    // Super class
    const superClass = view.getUint16(offset);
    offset += 2;
    
    // Interfaces
    const interfacesCount = view.getUint16(offset);
    offset += 2;
    const interfaces = [];
    for (let i = 0; i < interfacesCount; i++) {
      interfaces.push(view.getUint16(offset));
      offset += 2;
    }
    
    // Fields
    const fieldsCount = view.getUint16(offset);
    offset += 2;
    const fields = this.parseFields(view, offset, fieldsCount, constantPool.constants);
    offset = fields.nextOffset;
    
    // Methods
    const methodsCount = view.getUint16(offset);
    offset += 2;
    const methods = this.parseMethods(view, offset, methodsCount, constantPool.constants);
    
    return {
      version: { major: majorVersion, minor: minorVersion },
      constantPool: constantPool.constants,
      accessFlags,
      className: this.getClassName(thisClass, constantPool.constants),
      superClassName: this.getClassName(superClass, constantPool.constants),
      interfaces,
      fields: fields.fields,
      methods: methods.methods
    };
  }
}
```

### XAP Parser

```typescript
export class XAPParser {
  async parse(buffer: ArrayBuffer): Promise<XAPData> {
    const zip = await JSZip.loadAsync(buffer);
    const manifest = await this.parseAppManifest(zip);
    const xamlFiles: XAMLFile[] = [];
    
    // Find all XAML files
    const xamlFilenames = Object.keys(zip.files).filter(name => name.endsWith('.xaml'));
    
    for (const filename of xamlFilenames) {
      const xamlContent = await zip.file(filename)!.async('string');
      const parsed = await this.parseXAML(xamlContent);
      xamlFiles.push({
        filename,
        content: xamlContent,
        parsed
      });
    }
    
    return {
      manifest,
      xamlFiles,
      entryPoint: manifest.entryPointAssembly
    };
  }
  
  private async parseXAML(content: string): Promise<XAMLElement> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    const root = doc.documentElement;
    
    return this.parseElement(root);
  }
  
  private parseElement(element: Element): XAMLElement {
    const tagName = element.tagName;
    const attributes: Record<string, string> = {};
    const children: XAMLElement[] = [];
    
    // Parse attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    // Parse children
    for (let i = 0; i < element.children.length; i++) {
      children.push(this.parseElement(element.children[i]));
    }
    
    return {
      tagName,
      attributes,
      children,
      textContent: element.textContent || ''
    };
  }
}
```

### DCR Parser

```typescript
export class DCRParser {
  async parse(buffer: ArrayBuffer): Promise<DCRData> {
    const view = new DataView(buffer);
    
    // Parse RIFX header
    const signature = this.readString(view, 0, 4);
    if (signature !== 'RIFX' && signature !== 'XFIR') {
      throw new Error('Invalid Director file');
    }
    
    const fileSize = view.getUint32(4, false);
    const fileType = this.readString(view, 8, 4);
    
    // Parse chunks
    const chunks = this.parseChunks(view, 12);
    
    // Extract cast members
    const castMembers = this.extractCastMembers(chunks);
    
    // Extract scripts
    const scripts = this.extractScripts(chunks);
    
    // Extract movie properties
    const movieProps = this.extractMovieProperties(chunks);
    
    return {
      version: this.detectVersion(chunks),
      movieProperties: movieProps,
      castMembers,
      scripts,
      score: this.extractScore(chunks)
    };
  }
  
  private extractScripts(chunks: Chunk[]): LingoScript[] {
    const scripts: LingoScript[] = [];
    
    for (const chunk of chunks) {
      if (chunk.type === 'Lscr') {
        const script = this.parseLingoScript(chunk.data);
        scripts.push(script);
      }
    }
    
    return scripts;
  }
  
  private parseLingoScript(data: Uint8Array): LingoScript {
    const reader = new BitReader(data);
    const bytecode: LingoInstruction[] = [];
    
    while (reader.hasMore()) {
      const opcode = reader.readUInt8();
      const instruction = this.decodeLingoInstruction(opcode, reader);
      bytecode.push(instruction);
    }
    
    return {
      bytecode,
      constants: this.extractConstants(data),
      handlers: this.identifyHandlers(bytecode)
    };
  }
}
```

## Interpreters

### ActionScript Interpreter

```typescript
export class ActionScriptInterpreter implements Interpreter {
  private stack: any[] = [];
  private variables: Map<string, any> = new Map();
  private movieClips: Map<string, MovieClip> = new Map();
  private currentFrame: number = 0;
  private isPlaying: boolean = false;

  async load(swfData: SWFData) {
    // Initialize movie clips from sprites
    for (const tag of swfData.tags) {
      if (tag.type === 'DefineSprite') {
        const mc = new MovieClip(tag);
        this.movieClips.set(tag.id.toString(), mc);
      }
    }
    
    // Execute frame 1 actions
    this.gotoFrame(1);
  }

  update(deltaTime: number) {
    if (!this.isPlaying) return;
    
    // Update all movie clips
    for (const mc of this.movieClips.values()) {
      mc.update(deltaTime);
    }
    
    // Execute frame actions
    this.executeFrameActions();
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Render all movie clips
    for (const mc of this.movieClips.values()) {
      mc.render(ctx);
    }
  }

  private executeAction(action: ActionScriptAction) {
    switch (action.code) {
      case 0x96: // Push
        this.executePush(action.data);
        break;
      case 0x17: // Pop
        this.stack.pop();
        break;
      case 0x0A: // Add
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(a + b);
        break;
      case 0x06: // Play
        this.isPlaying = true;
        break;
      case 0x07: // Stop
        this.isPlaying = false;
        break;
      case 0x81: // GotoFrame
        const frame = new DataView(action.data.buffer).getUint16(0, true);
        this.gotoFrame(frame);
        break;
      // ... more opcodes
    }
  }
}
```

### JVM Interpreter

```typescript
export class JVMInterpreter implements Interpreter {
  private stack: any[] = [];
  private locals: any[] = [];
  private heap: Map<number, any> = new Map();
  private classes: Map<string, ClassFile> = new Map();
  private pc: number = 0; // Program counter

  async load(jarData: JARData) {
    // Load all classes
    for (const classFile of jarData.classes) {
      this.classes.set(classFile.className, classFile);
    }
    
    // Find and execute main method
    const mainClass = this.classes.get(jarData.mainClass);
    if (!mainClass) {
      throw new Error('Main class not found');
    }
    
    const mainMethod = mainClass.methods.find(m => m.name === 'main');
    if (!mainMethod) {
      throw new Error('Main method not found');
    }
    
    this.executeMethod(mainMethod);
  }

  private executeMethod(method: Method) {
    const code = method.code;
    this.pc = 0;
    
    while (this.pc < code.length) {
      const opcode = code[this.pc];
      this.pc++;
      
      switch (opcode) {
        case 0x2A: // aload_0
          this.stack.push(this.locals[0]);
          break;
        case 0x1A: // iload_0
          this.stack.push(this.locals[0]);
          break;
        case 0xB6: // invokevirtual
          const methodIndex = (code[this.pc] << 8) | code[this.pc + 1];
          this.pc += 2;
          this.invokeVirtual(methodIndex);
          break;
        case 0xB1: // return
          return;
        case 0x60: // iadd
          const val2 = this.stack.pop();
          const val1 = this.stack.pop();
          this.stack.push(val1 + val2);
          break;
        // ... more opcodes
      }
    }
  }
}
```

## Renderers

### Canvas Renderer

```typescript
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  renderShape(shape: Shape, transform: Matrix) {
    this.ctx.save();
    this.applyTransform(transform);
    
    this.ctx.beginPath();
    
    for (const edge of shape.edges) {
      if (edge.type === 'line') {
        this.ctx.lineTo(edge.x, edge.y);
      } else if (edge.type === 'curve') {
        this.ctx.quadraticCurveTo(edge.cx, edge.cy, edge.x, edge.y);
      }
    }
    
    if (shape.fillStyle) {
      this.applyFillStyle(shape.fillStyle);
      this.ctx.fill();
    }
    
    if (shape.lineStyle) {
      this.applyLineStyle(shape.lineStyle);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private applyTransform(matrix: Matrix) {
    this.ctx.transform(
      matrix.a, matrix.b,
      matrix.c, matrix.d,
      matrix.tx, matrix.ty
    );
  }

  private applyFillStyle(fillStyle: FillStyle) {
    if (fillStyle.type === 'solid') {
      this.ctx.fillStyle = this.rgbaToString(fillStyle.color);
    } else if (fillStyle.type === 'gradient') {
      const gradient = this.ctx.createLinearGradient(
        fillStyle.x1, fillStyle.y1,
        fillStyle.x2, fillStyle.y2
      );
      for (const stop of fillStyle.stops) {
        gradient.addColorStop(stop.ratio, this.rgbaToString(stop.color));
      }
      this.ctx.fillStyle = gradient;
    }
  }
}
```

## Audio Engine

```typescript
export class AudioEngine {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
  }

  async loadSound(id: string, data: ArrayBuffer) {
    const audioBuffer = await this.audioContext.decodeAudioData(data);
    this.sounds.set(id, audioBuffer);
  }

  playSound(id: string, loop: boolean = false) {
    const buffer = this.sounds.get(id);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.audioContext.destination);
    source.start();
    
    return source;
  }

  stopSound(source: AudioBufferSourceNode) {
    source.stop();
  }
}
```

## Testing Strategy

- Unit tests for each parser with sample files
- Unit tests for interpreter opcodes
- Integration tests for full file parsing and execution
- Performance tests for rendering and audio
- Test with real legacy files from each format
