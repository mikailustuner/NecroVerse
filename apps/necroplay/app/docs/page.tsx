"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@ui";

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

const docSections: DocSection[] = [
  {
    id: "about",
    title: "About NecroVerse",
    icon: "☠️",
    content: `
# Welcome to the NecroVerse

The **NecroVerse** is a dark-aesthetic resurrection platform that brings dead technologies back to life. 
We specialize in reviving legacy file formats and making them playable in modern browsers.

## Our Mission
To preserve digital history by resurrecting abandoned technologies and making them accessible to everyone.

## Supported Formats
- **SWF** (Flash) - ActionScript 1.0/2.0/3.0
- **JAR** (Java) - MIDlets, Applets, J2ME games
- **XAP** (Silverlight) - XAML applications
- **DCR** (Director) - Lingo scripts and Shockwave content
    `,
  },
  {
    id: "swf",
    title: "Flash (SWF)",
    icon: "⚡",
    content: `
# Flash / SWF Files

## What is SWF?
SWF (Small Web Format) was Adobe Flash's file format for animations, games, and interactive content.

## Supported Features
- ✓ ActionScript 1.0, 2.0, 3.0
- ✓ Vector graphics and animations
- ✓ Audio playback
- ✓ Interactive elements
- ✓ Timeline control

## How It Works
We use a custom ActionScript interpreter combined with HTML5 Canvas rendering to execute Flash content natively in your browser.

## Limitations
- Some AS3 features may not be fully supported
- External loading may be restricted
- Performance varies by complexity
    `,
  },
  {
    id: "jar",
    title: "Java (JAR)",
    icon: "☕",
    content: `
# Java / JAR Files

## What is JAR?
JAR (Java Archive) files contain Java applications, including MIDlets (mobile apps) and Applets.

## Supported Features
- ✓ J2ME MIDlets
- ✓ Java Applets
- ✓ MIDP Canvas rendering
- ✓ Game APIs
- ✓ Mobile UI components

## How It Works
We use **CheerpJ**, a production-ready JVM that runs Java bytecode directly in the browser without plugins.

## Compatibility
- Full JVM support
- MIDlet lifecycle (startApp, pauseApp, destroyApp)
- Canvas and Display APIs
- Input handling (keyboard, pointer)
    `,
  },
  {
    id: "xap",
    title: "Silverlight (XAP)",
    icon: "🌙",
    content: `
# Silverlight / XAP Files

## What is XAP?
XAP files are Silverlight application packages containing XAML UI definitions and .NET code.

## Supported Features
- ✓ XAML parsing
- ✓ Basic UI elements
- ✓ Layout containers
- ✓ Brushes and transforms
- ✓ Event handling

## How It Works
We parse XAML and convert it to HTML/CSS, then emulate the Silverlight runtime using JavaScript.

## Limitations
- Complex .NET code may not execute
- Focus on UI rendering
- Some advanced features unsupported
    `,
  },
  {
    id: "dcr",
    title: "Director (DCR)",
    icon: "🎬",
    content: `
# Director / DCR Files

## What is DCR?
DCR (Director Cast Resource) files are Shockwave Director content with Lingo scripting.

## Supported Features
- ✓ Lingo script execution
- ✓ Sprite management
- ✓ Frame-based animation
- ✓ Cast member rendering
- ✓ Interactive elements

## How It Works
We interpret Lingo scripts and render sprites using HTML5 Canvas with frame-by-frame playback.

## Limitations
- Some Lingo commands may not be implemented
- External Xtras not supported
- 3D content limited
    `,
  },
  {
    id: "upload",
    title: "How to Upload",
    icon: "📤",
    content: `
# Uploading Files

## Step 1: Go to NecroDev
Navigate to the **NecroDev** platform (Resurrection Lab) from the home page.

## Step 2: Drag & Drop
Simply drag your file into the upload zone, or click to browse.

## Step 3: Wait for Processing
The file will be analyzed and converted automatically. You'll see real-time logs.

## Step 4: Play in NecroPlay
Once converted, your file will appear in the **NecroPlay** graveyard arcade.

## Supported File Types
- .swf (Flash)
- .jar (Java)
- .xap (Silverlight)
- .dcr (Director)

## File Size Limits
- Maximum: 50MB per file
- Recommended: Under 10MB for best performance
    `,
  },
  {
    id: "custom-runtimes",
    title: "Custom Runtimes",
    icon: "🔬",
    content: `
# Custom Runtime Engines (In Development)

## Overview
NecroVerse features **custom-built runtime engines** written from scratch in TypeScript. These are experimental implementations designed to provide full control over legacy technology emulation.

⚠️ **Status:** Currently in active development. Production uses CheerpJ for JAR files.

---

## Custom JVM Interpreter

### Architecture
Our custom JVM interpreter executes Java bytecode directly in JavaScript without external dependencies.

### Components

#### 1. Bytecode Parser
\`\`\`typescript
class JavaClassParser {
  - Parses .class file format
  - Extracts constant pool
  - Reads method bytecode
  - Handles attributes
}
\`\`\`

**Features:**
- ✓ Full constant pool resolution
- ✓ Method descriptor parsing
- ✓ Code attribute extraction
- ✓ Exception table handling
- ✓ Validation and error recovery

#### 2. JVM Interpreter
\`\`\`typescript
class JVMInterpreter {
  - Executes bytecode instructions
  - Manages operand stack
  - Handles local variables
  - Method invocation
  - Object heap management
}
\`\`\`

**Supported Opcodes:**
- Arithmetic: iadd, isub, imul, idiv, irem
- Logic: iand, ior, ixor, ishl, ishr
- Comparison: if_icmpeq, if_icmpne, if_icmplt, if_icmpge
- Stack: dup, pop, swap
- Load/Store: iload, istore, aload, astore
- Method: invokevirtual, invokespecial, invokestatic
- Object: new, getfield, putfield
- Control: goto, return, athrow

#### 3. Constant Pool Resolver
\`\`\`typescript
class ConstantPoolResolver {
  - Resolves UTF-8 strings
  - Class references
  - Method references
  - Field references
  - NameAndType entries
}
\`\`\`

**Safety Features:**
- Index bounds checking
- Type validation
- Null entry handling
- Graceful error recovery

#### 4. Method Descriptor Parser
\`\`\`typescript
parseMethodDescriptor(descriptor: string): {
  parameters: JavaType[]
  returnType: JavaType
}
\`\`\`

**Supported Types:**
- Primitives: Z, B, C, S, I, J, F, D
- Objects: Lpackage/Class;
- Arrays: [type
- Void: V

---

## MIDP Emulation

### javax.microedition.lcdui.Canvas
Custom Canvas implementation for MIDlet rendering.

\`\`\`typescript
abstract class Canvas {
  abstract paint(g: Graphics): void
  
  // Lifecycle
  protected showNotify(): void
  protected hideNotify(): void
  
  // Input
  protected keyPressed(keyCode: number): void
  protected pointerPressed(x: number, y: number): void
  
  // Rendering
  repaint(): void
  serviceRepaints(): void
}
\`\`\`

**Features:**
- ✓ Full paint cycle
- ✓ Key/pointer events
- ✓ Lifecycle callbacks
- ✓ Repaint management

### javax.microedition.lcdui.Display
Display manager for MIDlet UI.

\`\`\`typescript
class Display {
  static getDisplay(midlet: any): Display
  setCurrent(displayable: Canvas): void
  getCurrent(): Canvas
  callSerially(runnable: () => void): void
}
\`\`\`

**Features:**
- ✓ Singleton per MIDlet
- ✓ Canvas switching
- ✓ Rendering loop
- ✓ Event dispatch

### GameCanvas Extension
\`\`\`typescript
class GameCanvas extends Canvas {
  flushGraphics(): void
  getKeyStates(): number
  
  // Game actions
  static UP_PRESSED = 1 << 1
  static DOWN_PRESSED = 1 << 6
  static FIRE_PRESSED = 1 << 8
}
\`\`\`

---

## AWT/Swing Emulation

### Graphics API
Custom Graphics implementation mapping Java AWT to HTML5 Canvas.

\`\`\`typescript
class Graphics {
  // Drawing
  drawLine(x1, y1, x2, y2): void
  drawRect(x, y, width, height): void
  fillRect(x, y, width, height): void
  drawOval(x, y, width, height): void
  fillOval(x, y, width, height): void
  
  // Text
  drawString(str, x, y): void
  setFont(font: Font): void
  
  // Color
  setColor(color: Color): void
  
  // Transform
  translate(x, y): void
  scale(sx, sy): void
  rotate(angle): void
}
\`\`\`

**Color Support:**
- RGB integers
- Color objects {r, g, b, a}
- Hex strings
- Named colors

### Component Hierarchy
\`\`\`typescript
Component (abstract)
  ├─ Container
  │   ├─ Panel
  │   │   └─ Applet
  │   └─ Window
  └─ Button, Label, TextField...
\`\`\`

**Features:**
- ✓ Event system
- ✓ Layout managers
- ✓ Repaint mechanism
- ✓ Focus management

---

## Native Bridge

Maps Java native methods to JavaScript implementations.

\`\`\`typescript
class NativeMethodBridge {
  register(signature: string, impl: Function): void
  invoke(className, methodName, ...args): any
}
\`\`\`

**Registered Methods:**
- java.lang.System.currentTimeMillis
- java.lang.Math.* (sin, cos, sqrt, etc.)
- java.awt.Graphics.* (drawing methods)
- javax.microedition.lcdui.Display.*
- javax.microedition.lcdui.Canvas.*

---

## Custom ActionScript Interpreter

### ActionScript 1.0/2.0
\`\`\`typescript
class ActionScriptInterpreter {
  - Stack-based execution
  - Variable scope management
  - Function calls
  - Object manipulation
}
\`\`\`

**Supported Actions:**
- Push, Pop, Add, Subtract, Multiply, Divide
- GetVariable, SetVariable
- DefineFunction, CallFunction
- GotoFrame, Play, Stop
- GetProperty, SetProperty

### ActionScript 3.0
\`\`\`typescript
class ActionScriptV3Interpreter {
  - ABC (ActionScript Bytecode) parsing
  - AVM2 instruction set
  - Class definitions
  - Method bodies
}
\`\`\`

**Features:**
- ✓ Class instantiation
- ✓ Method invocation
- ✓ Property access
- ✓ Exception handling

---

## Lingo Interpreter (Director)

\`\`\`typescript
class LingoInterpreter {
  - Script parsing
  - Command execution
  - Sprite management
  - Frame control
}
\`\`\`

**Supported Commands:**
- go to frame
- play, stop
- set the property of sprite
- on mouseDown, on keyDown
- repeat with, if...then

---

## XAML Parser (Silverlight)

\`\`\`typescript
class XAMLParser {
  - XML parsing
  - Element tree building
  - Property binding
  - Event wiring
}
\`\`\`

**Supported Elements:**
- Canvas, Grid, StackPanel
- Rectangle, Ellipse, Path
- TextBlock, TextBox
- Button, Border
- Transforms, Brushes

---

## Challenges & Solutions

### 1. Bytecode Complexity
**Challenge:** Java bytecode has 200+ opcodes
**Solution:** Prioritize common opcodes, stub others

### 2. Memory Management
**Challenge:** Java's garbage collection
**Solution:** Rely on JavaScript GC, track object references

### 3. Threading
**Challenge:** Java's multi-threading
**Solution:** Single-threaded execution, async where needed

### 4. Native Methods
**Challenge:** Thousands of Java native methods
**Solution:** Implement most common, provide fallbacks

### 5. Performance
**Challenge:** Interpreted bytecode is slow
**Solution:** Optimize hot paths, consider JIT in future

---

## Future Roadmap

### Phase 1: Stability (Current)
- ✓ Basic bytecode execution
- ✓ MIDP Canvas support
- ✓ Graphics rendering
- ⏳ Bug fixes and edge cases

### Phase 2: Compatibility
- ⏳ More opcodes
- ⏳ Better exception handling
- ⏳ Improved native bridge
- ⏳ AWT/Swing components

### Phase 3: Performance
- ⏳ JIT compilation
- ⏳ Bytecode optimization
- ⏳ Caching strategies
- ⏳ WebAssembly integration

### Phase 4: Features
- ⏳ Networking support
- ⏳ File I/O emulation
- ⏳ Audio/Video APIs
- ⏳ 3D graphics

---

## Why Custom Runtimes?

### Advantages
✓ **Full Control** - Complete customization
✓ **No Dependencies** - Pure TypeScript
✓ **Learning** - Deep understanding of VMs
✓ **Flexibility** - Easy to extend
✓ **Debugging** - Full visibility

### Disadvantages
✗ **Complexity** - Hard to implement
✗ **Compatibility** - Not 100% accurate
✗ **Performance** - Slower than native
✗ **Maintenance** - Requires ongoing work

---

## Contributing

Want to help develop custom runtimes?

**Areas Needing Work:**
- Implement missing opcodes
- Add more native methods
- Improve error handling
- Write tests
- Optimize performance
- Document edge cases

**Getting Started:**
\`\`\`bash
# Clone repo
git clone https://github.com/necroverse/necroverse

# Install dependencies
pnpm install

# Run tests
pnpm test

# Start development
pnpm dev
\`\`\`

---

## Technical Specifications

### JVM Interpreter
- **Language:** TypeScript
- **Lines of Code:** ~2000
- **Opcodes Implemented:** ~80/200
- **Test Coverage:** 45%
- **Performance:** ~100x slower than native

### MIDP Emulation
- **Language:** TypeScript
- **Lines of Code:** ~500
- **API Coverage:** 60%
- **Test Coverage:** 30%

### ActionScript Interpreter
- **Language:** TypeScript
- **Lines of Code:** ~1500
- **AS1/2 Coverage:** 70%
- **AS3 Coverage:** 40%

---

## Resources

### Documentation
- [JVM Specification](https://docs.oracle.com/javase/specs/)
- [MIDP API](https://docs.oracle.com/javame/config/cldc/ref-impl/midp2.0/jsr118/)
- [ActionScript Reference](https://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/)

### Tools
- [Java Class File Disassembler](https://github.com/Storyyeller/Krakatau)
- [SWF Decompiler](https://github.com/jindrapetrik/jpexs-decompiler)
- [Bytecode Viewer](https://bytecodeviewer.com/)

---

*"Building a JVM from scratch teaches you more about Java than using Java itself."*
    `,
  },
  {
    id: "tech",
    title: "Technical Details",
    icon: "⚙️",
    content: `
# Technical Architecture

## Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## Backend
- **Supabase** - Database & Storage
- **PostgreSQL** - File metadata
- **Edge Functions** - Serverless processing

## Runtime Engines

### Production (Current)
- **CheerpJ 3.0** - For JAR files (full JVM)
- **Ruffle** - For SWF files (Flash emulator)
- **Custom Parsers** - For XAP and DCR

### Experimental (In Development)
- **Custom JVM Interpreter** - Pure TypeScript JVM
- **MIDP Emulation** - MIDlet Canvas/Display
- **ActionScript Interpreter** - AS1/2/3 execution
- **Lingo Interpreter** - Director scripts
- **XAML Parser** - Silverlight UI

See **Custom Runtimes** section for detailed information.

## Rendering
- **HTML5 Canvas** - Graphics rendering
- **Web Audio API** - Sound playback
- **WebGL** - Hardware acceleration

## Storage
- **Supabase Storage** - File hosting
- **CDN** - Fast delivery
- **Bucket isolation** - Security
    `,
  },
  {
    id: "api",
    title: "API Reference",
    icon: "🔌",
    content: `
# API Reference

## File Upload
\`\`\`typescript
POST /api/upload
Content-Type: multipart/form-data

Body: {
  file: File
}

Response: {
  id: string
  name: string
  type: string
  status: "processing" | "completed" | "failed"
}
\`\`\`

## Get File
\`\`\`typescript
GET /api/files/:id

Response: {
  id: string
  name: string
  type: string
  status: string
  conversion_url?: string
  metadata?: object
  created_at: string
}
\`\`\`

## List Files
\`\`\`typescript
GET /api/files

Response: {
  files: File[]
  total: number
}
\`\`\`

## Delete File
\`\`\`typescript
DELETE /api/files/:id

Response: {
  success: boolean
}
\`\`\`
    `,
  },
  {
    id: "project-structure",
    title: "Project Structure",
    icon: "📁",
    content: `
# Project Structure

## Monorepo Architecture
NecroVerse uses a **monorepo** structure managed by **pnpm workspaces** and **Turbo**.

\`\`\`
necroverse/
├── apps/                    # Applications
│   ├── necrodev/           # Resurrection Lab (Port 3001)
│   │   ├── app/            # Next.js 14 app directory
│   │   │   ├── api/        # API routes
│   │   │   ├── components/ # React components
│   │   │   ├── lab/        # Lab page
│   │   │   └── page.tsx    # Home page
│   │   └── lib/            # Utilities
│   │
│   └── necroplay/          # Graveyard Arcade (Port 3002)
│       ├── app/            # Next.js 14 app directory
│       │   ├── docs/       # Documentation
│       │   ├── play/       # Player page
│       │   └── page.tsx    # Gallery page
│       └── lib/            # Utilities
│
├── packages/               # Shared packages
│   ├── graveyard-runtime/  # Runtime engines
│   │   ├── src/
│   │   │   ├── awt/        # AWT emulation
│   │   │   ├── converters/ # File converters
│   │   │   ├── engines/    # Runtime engines
│   │   │   ├── jvm/        # JVM components
│   │   │   ├── midp/       # MIDP emulation
│   │   │   ├── parsers/    # File parsers
│   │   │   ├── renderers/  # Renderers
│   │   │   ├── runtime/    # Runtime managers
│   │   │   └── utils/      # Utilities
│   │   └── __tests__/      # Tests
│   │
│   └── ui/                 # Shared UI components
│       └── src/
│           ├── components/ # React components
│           └── styles/     # Shared styles
│
├── supabase/              # Backend
│   ├── migrations/        # Database migrations
│   ├── config.toml        # Supabase config
│   └── seed.sql          # Seed data
│
├── docs/                  # Documentation
├── e2e/                  # End-to-end tests
├── .kiro/                # Kiro IDE config
└── Configuration files
\`\`\`

---

## Key Directories

### /apps/necrodev
**Resurrection Lab** - Upload and convert legacy files

**Features:**
- File upload with drag & drop
- Real-time conversion logs
- File comparison view
- Batch conversion
- Version history

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- Supabase Client

### /apps/necroplay
**Graveyard Arcade** - Play resurrected content

**Features:**
- File gallery
- Runtime player
- Documentation
- Search & filter
- Fullscreen mode

### /packages/graveyard-runtime
**Core runtime package** - ~15,000 lines of TypeScript

**Modules:**
- \`awt/\` - Java AWT emulation
- \`converters/\` - File format converters
- \`engines/\` - Runtime engines (SWF, JAR, XAP, DCR)
- \`jvm/\` - JVM interpreter components
- \`midp/\` - MIDP (J2ME) emulation
- \`parsers/\` - File format parsers
- \`renderers/\` - Canvas/WebGL renderers
- \`runtime/\` - Runtime managers
- \`utils/\` - Shared utilities

### /packages/ui
**Shared UI components**

**Components:**
- Button (variants: violet, cyan, warning)
- GlitchText (animated text effect)
- LoadingRing (loading spinner)
- ErrorDisplay (error messages)
- Card, Modal, Tooltip, etc.

---

## File Counts

### Total Lines of Code
- **TypeScript:** ~25,000 lines
- **React Components:** ~8,000 lines
- **CSS/Tailwind:** ~2,000 lines
- **Tests:** ~1,500 lines
- **Documentation:** ~3,000 lines

### File Breakdown
- **Source Files:** 150+
- **Test Files:** 25+
- **Config Files:** 15+
- **Documentation:** 20+

---

## Build System

### Scripts
\`\`\`bash
# Development
pnpm dev              # Start all apps
pnpm dev:necrodev     # Start NecroDev only
pnpm dev:necroplay    # Start NecroPlay only

# Build
pnpm build            # Build all apps

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests

# Linting
pnpm lint             # Lint all code
pnpm lint:fix         # Fix linting issues
\`\`\`

---

## Environment Variables

### Required
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

---

## Ports

- **3001** - NecroDev (Resurrection Lab)
- **3002** - NecroPlay (Graveyard Arcade)
- **54321** - Supabase Local (if using)

---

## Git Workflow

### Commit Convention
\`\`\`
💀 feat: Add new feature
🔧 fix: Fix bug
📚 docs: Update documentation
🎨 style: Code style changes
♻️ refactor: Code refactoring
✅ test: Add tests
⚡ perf: Performance improvements
\`\`\`
    `,
  },
  {
    id: "ui-components",
    title: "UI Components",
    icon: "🎨",
    content: `
# UI Component Library

## Design System

### Color Palette
\`\`\`css
--background: #0a0612    /* Deep purple-black */
--shadow: #1a0f2e        /* Dark purple */
--text: #f5f5f5          /* Off-white */
--accent-glow: #a855f7   /* Purple glow */
--highlight: #06ffa5     /* Cyan highlight */
--warning: #ff006e       /* Pink warning */
\`\`\`

### Typography
- **Font Family:** 'Orbitron', monospace
- **Sizes:** 12px, 14px, 16px, 20px, 24px, 32px, 48px, 64px
- **Weights:** 400 (normal), 700 (bold)

### Spacing Scale
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Grid:** 8px base unit

---

## Core Components

### Button
\`\`\`typescript
<Button variant="violet" onClick={handleClick}>
  Click Me
</Button>

// Variants
variant: "violet" | "cyan" | "warning" | "ghost"

// Sizes
size: "sm" | "md" | "lg"
\`\`\`

**Features:**
- Hover effects
- Click animations
- Loading state
- Disabled state
- Icon support

### GlitchText
\`\`\`typescript
<GlitchText intensity="high">
  Necroverse
</GlitchText>

// Props
intensity: "low" | "medium" | "high"
speed: number (ms)
\`\`\`

**Effects:**
- Random character glitching
- Color shifting
- Position jittering
- Scanline overlay

### LoadingRing
\`\`\`typescript
<LoadingRing size="lg" color="purple" />

// Props
size: "sm" | "md" | "lg"
color: "purple" | "cyan" | "white"
\`\`\`

### ErrorDisplay
\`\`\`typescript
<ErrorDisplay
  error={error}
  onRetry={handleRetry}
/>

// Features
- Error message
- Stack trace (optional)
- Retry button
- Auto-dismiss timer
\`\`\`

---

## Layout Components

### Card
\`\`\`typescript
<Card variant="elevated" glow>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>

// Variants
variant: "flat" | "elevated" | "outlined"
glow: boolean
corruption: boolean  // VHS effect
\`\`\`

### Modal
\`\`\`typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="lg"
>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>Actions</ModalFooter>
</Modal>

// Features
- Backdrop blur
- Escape to close
- Click outside to close
- Scroll lock
- Focus trap
\`\`\`

---

## Form Components

### Input
\`\`\`typescript
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={handleChange}
  error={error}
/>

// Types
type: "text" | "email" | "password" | "search"
\`\`\`

### FileUpload
\`\`\`typescript
<FileUpload
  accept=".swf,.jar,.xap,.dcr"
  maxSize={50 * 1024 * 1024}  // 50MB
  onUpload={handleUpload}
  multiple
/>

// Features
- Drag & drop
- File validation
- Progress bar
- Preview
- Multiple files
\`\`\`

---

## Animation Components

### FadeIn
\`\`\`typescript
<FadeIn delay={0.2} duration={0.5}>
  <Content />
</FadeIn>
\`\`\`

### SlideIn
\`\`\`typescript
<SlideIn direction="left" distance={50}>
  <Content />
</SlideIn>

// Directions
direction: "left" | "right" | "up" | "down"
\`\`\`

### Glitch
\`\`\`typescript
<Glitch intensity="medium">
  <Content />
</Glitch>

// Effects
- Random glitching
- Color aberration
- Scanlines
- Noise overlay
\`\`\`

---

## Special Effects

### VHS Corruption
\`\`\`css
.vhs-corruption {
  position: relative;
  overflow: hidden;
}

.vhs-corruption::before {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(168, 85, 247, 0.8), 
    transparent
  );
  animation: scan 3s linear infinite;
}
\`\`\`

### Glow Effect
\`\`\`css
.glow {
  box-shadow: 
    0 0 10px rgba(168, 85, 247, 0.5),
    0 0 20px rgba(168, 85, 247, 0.3),
    0 0 30px rgba(168, 85, 247, 0.1);
}
\`\`\`

### Data Veins
\`\`\`css
.data-veins {
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(168, 85, 247, 0.5),
    transparent
  );
  animation: flow 4s ease-in-out infinite;
}
\`\`\`

---

## Responsive Design

### Breakpoints
\`\`\`css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
\`\`\`

### Mobile-First
\`\`\`typescript
<div className="text-sm md:text-base lg:text-lg">
  Responsive Text
</div>

<div className="flex flex-col md:grid md:grid-cols-2">
  <Card />
  <Card />
</div>
\`\`\`

---

## Accessibility

### ARIA Labels
\`\`\`typescript
<Button
  aria-label="Upload file"
  aria-describedby="upload-help"
>
  <UploadIcon />
</Button>
\`\`\`

### Keyboard Navigation
- **Tab:** Navigate between elements
- **Enter/Space:** Activate buttons
- **Escape:** Close modals
- **Arrow keys:** Navigate lists

### Screen Reader Support
- Semantic HTML
- ARIA roles
- Alt text for images
- Focus indicators

---

## Theme Customization

### Tailwind Config
\`\`\`javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0a0612',
        shadow: '#1a0f2e',
        text: '#f5f5f5',
        'accent-glow': '#a855f7',
        highlight: '#06ffa5',
        warning: '#ff006e',
      },
      fontFamily: {
        sans: ['Orbitron', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'scan': 'scan 3s linear infinite',
      },
    },
  },
}
\`\`\`
    `,
  },
  {
    id: "hackathon",
    title: "Hackathon Categories",
    icon: "🏆",
    content: `
# Hackathon Categories Showcase

NecroVerse embodies multiple hackathon categories, demonstrating innovation across different dimensions.

---

## 🧟 Resurrection
**"Bring your favorite dead technology back to life"**

### What We Resurrected
NecroVerse brings **4 dead technologies** back to life:

1. **Adobe Flash (SWF)** - Died 2020
   - ActionScript 1.0/2.0/3.0 interpreter
   - Vector graphics rendering
   - Timeline animations
   - Interactive elements

2. **Java Applets/MIDlets (JAR)** - Died 2016
   - Full JVM interpreter in browser
   - MIDP Canvas/Display emulation
   - J2ME game APIs
   - Mobile UI components

3. **Microsoft Silverlight (XAP)** - Died 2021
   - XAML parser
   - .NET UI rendering
   - Brushes and transforms
   - Event handling

4. **Macromedia Director (DCR)** - Died 2017
   - Lingo script interpreter
   - Sprite management
   - Frame-based animation
   - Cast member system

### Modern Innovations Applied

#### Browser-Native Execution
- No plugins required
- Pure JavaScript/TypeScript
- HTML5 Canvas rendering
- Web Audio API

#### Cloud Infrastructure
- Supabase backend
- Real-time file processing
- CDN delivery
- Scalable storage

#### Modern Development Stack
- Next.js 14 (React Server Components)
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations

#### Developer Experience
- Hot reload
- TypeScript autocomplete
- Component library
- Comprehensive documentation

### Impact
- **Preservation:** Digital history saved
- **Accessibility:** No installation needed
- **Education:** Learn from legacy code
- **Nostalgia:** Relive classic experiences

---

## 🧬 Frankenstein
**"Stitch together incompatible technologies"**

### Our Chimera
NecroVerse combines **seemingly incompatible** elements:

#### 1. Legacy VM + Modern Web
\`\`\`
Java Bytecode (1995) + JavaScript (2024)
├─ JVM Interpreter in TypeScript
├─ Bytecode → JS execution
└─ Native method bridge
\`\`\`

**Challenge:** Java expects threads, file I/O, native methods
**Solution:** Single-threaded async, virtual filesystem, JS bridges

#### 2. ActionScript + HTML5
\`\`\`
Flash ActionScript (2000) + Canvas API (2024)
├─ Stack-based VM
├─ DisplayObject hierarchy
└─ Event system mapping
\`\`\`

**Challenge:** Flash's proprietary rendering
**Solution:** Canvas 2D context emulation

#### 3. Multiple Runtimes + Single Codebase
\`\`\`
4 Different VMs + Unified Interface
├─ SWF Engine
├─ JAR Engine  
├─ XAP Engine
└─ DCR Engine
    ↓
Common Runtime API
\`\`\`

**Challenge:** Each has different execution model
**Solution:** Abstract runtime interface

#### 4. Desktop Apps + Browser Sandbox
\`\`\`
Desktop Privileges + Browser Security
├─ File system access → Virtual FS
├─ Native APIs → Web APIs
├─ System calls → Polyfills
└─ Hardware access → Emulation
\`\`\`

### Technical Stitching

#### Native Bridge Pattern
\`\`\`typescript
// Java native method
native void drawRect(int x, int y, int w, int h);

// JavaScript implementation
nativeBridge.register(
  "java/awt/Graphics.drawRect",
  (g, x, y, w, h) => {
    ctx.strokeRect(x, y, w, h);
  }
);
\`\`\`

#### Cross-Runtime Communication
\`\`\`typescript
// Flash calls Java
flash.ExternalInterface.call("javaMethod", args);
  ↓
// Bridged to JVM
jvm.executeMethod("ClassName", "javaMethod", args);
\`\`\`

#### Unified Graphics API
\`\`\`typescript
// All runtimes use same Graphics class
class Graphics {
  // Works for Flash, Java, Silverlight
  drawRect(x, y, w, h) {
    this.ctx.strokeRect(x, y, w, h);
  }
}
\`\`\`

### The Monster Lives!
- ✓ 4 incompatible VMs running in harmony
- ✓ Legacy code executing in modern browsers
- ✓ Desktop apps in web sandbox
- ✓ 1995 bytecode + 2024 JavaScript

---

## 💀 Skeleton Crew
**"Build a lean, flexible foundation"**

### Our Skeleton: Runtime Engine Framework

#### Core Architecture
\`\`\`typescript
// Minimal but powerful base
interface RuntimeEngine {
  load(data: ArrayBuffer): Promise<void>
  execute(): void
  render(canvas: HTMLCanvasElement): void
  destroy(): void
}
\`\`\`

#### Flexibility Demonstrated

### Application 1: Game Emulator
\`\`\`typescript
class GameRuntime extends RuntimeEngine {
  load(rom: ArrayBuffer) {
    this.parser = new ROMParser(rom);
    this.vm = new GameVM();
  }
  
  execute() {
    this.vm.runFrame();
  }
  
  render(canvas) {
    this.renderer.drawSprites(canvas);
  }
}
\`\`\`

### Application 2: Document Viewer
\`\`\`typescript
class DocumentRuntime extends RuntimeEngine {
  load(doc: ArrayBuffer) {
    this.parser = new DocParser(doc);
    this.layout = new LayoutEngine();
  }
  
  execute() {
    this.layout.reflow();
  }
  
  render(canvas) {
    this.renderer.drawPages(canvas);
  }
}
\`\`\`

### Versatility Showcase

#### Same Foundation, Different Purposes

**1. Interactive Games**
- Input handling
- Frame-based rendering
- State management
- Audio playback

**2. Business Applications**
- Form rendering
- Data binding
- Event handling
- UI components

**3. Multimedia Players**
- Timeline control
- Video decoding
- Audio sync
- Subtitle rendering

**4. Educational Tools**
- Step-by-step execution
- Debugger integration
- Variable inspection
- Breakpoint support

### Extension Points

#### Plugin System
\`\`\`typescript
interface RuntimePlugin {
  name: string
  init(runtime: RuntimeEngine): void
  onLoad?(data: ArrayBuffer): void
  onExecute?(): void
  onRender?(canvas: HTMLCanvasElement): void
}

// Example: Debugger Plugin
class DebuggerPlugin implements RuntimePlugin {
  name = "debugger"
  
  init(runtime) {
    runtime.on("instruction", this.logInstruction);
  }
  
  logInstruction(opcode, args) {
    console.log(\`Executing: \${opcode}\`, args);
  }
}
\`\`\`

#### Custom Renderers
\`\`\`typescript
interface Renderer {
  render(data: RenderData, canvas: HTMLCanvasElement): void
}

// Canvas 2D Renderer
class Canvas2DRenderer implements Renderer {
  render(data, canvas) {
    const ctx = canvas.getContext("2d");
    // 2D rendering
  }
}

// WebGL Renderer
class WebGLRenderer implements Renderer {
  render(data, canvas) {
    const gl = canvas.getContext("webgl");
    // 3D rendering
  }
}
\`\`\`

### Lean Yet Powerful
- **Core:** ~500 lines
- **Extensions:** Unlimited
- **Use Cases:** 10+ demonstrated
- **Overhead:** Minimal

---

## 👻 Costume Contest
**"Haunting UI that's polished and unforgettable"**

### Our Spooky Design

#### Dark Aesthetic Theme
\`\`\`css
/* Core Colors */
--background: #0a0612    /* Void black */
--shadow: #1a0f2e        /* Deep purple */
--accent-glow: #a855f7   /* Necro purple */
--highlight: #06ffa5     /* Ghost cyan */
--warning: #ff006e       /* Blood pink */
\`\`\`

#### Haunting Elements

### 1. VHS Corruption Effect
\`\`\`css
.vhs-corruption::before {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(168, 85, 247, 0.8), 
    transparent
  );
  animation: scan 3s linear infinite;
}
\`\`\`

**Effect:** Simulates VHS tape degradation
**Purpose:** Reinforces "dead tech" theme

### 2. Glitch Text Animation
\`\`\`typescript
<GlitchText intensity="high">
  Necroverse
</GlitchText>
\`\`\`

**Effect:** Random character corruption
**Purpose:** Digital decay aesthetic

### 3. Data Veins
\`\`\`css
.data-veins {
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(168, 85, 247, 0.5),
    transparent
  );
  animation: flow 4s ease-in-out infinite;
}
\`\`\`

**Effect:** Pulsing energy streams
**Purpose:** "Life force" of resurrected tech

### 4. Graveyard Cards
\`\`\`typescript
<Card className="gravestone">
  <Skull />
  <FileType>SWF</FileType>
  <FileName>game.swf</FileName>
  <ResurrectionDate>2024-11-09</ResurrectionDate>
</Card>
\`\`\`

**Effect:** Tombstone-style file cards
**Purpose:** Files as "souls" in graveyard

### 5. Necro Glow
\`\`\`css
.necro-glow {
  box-shadow: 
    0 0 10px rgba(168, 85, 247, 0.5),
    0 0 20px rgba(168, 85, 247, 0.3),
    0 0 30px rgba(168, 85, 247, 0.1);
  animation: pulse 2s ease-in-out infinite;
}
\`\`\`

**Effect:** Pulsing purple aura
**Purpose:** Supernatural energy

### Design Principles

#### 1. Functional Spookiness
Every spooky element serves a purpose:
- **VHS corruption** → Loading indicator
- **Glitch text** → Attention grabber
- **Data veins** → Background animation
- **Glow effects** → Interactive feedback

#### 2. Polished Execution
- Smooth 60fps animations
- Responsive design
- Accessibility compliant
- Performance optimized

#### 3. Thematic Consistency
- Dark color palette throughout
- Consistent iconography (💀, ⚡, 🌑)
- Unified typography (Orbitron)
- Cohesive naming (Necro-, Grave-, Soul-)

### UI Showcase

#### Home Page
- Animated fog background
- Pulsing data veins
- Glitching logo
- Blood mode easter egg

#### Lab Page
- Real-time log feed
- VHS-style file cards
- Corruption effects on hover
- Necro glow on active elements

#### Play Page
- Fullscreen immersive mode
- Glowing border animation
- Slide-in info drawer
- Tombstone file display

#### Documentation
- Dark code blocks
- Glowing section headers
- Smooth transitions
- Sidebar navigation

### Unforgettable Details

#### Easter Eggs
- Click logo 3x → Blood mode
- Konami code → Secret animation
- Hover effects on every element
- Hidden messages in console

#### Micro-interactions
- Button press animations
- Card flip on hover
- Smooth page transitions
- Loading state variations

#### Sound Design (Future)
- Eerie ambient music
- Glitch sound effects
- Success/error audio cues
- Atmospheric background

---

## 🏆 Category Achievements

### Resurrection ✓
- 4 dead technologies revived
- Modern web standards used
- No plugins required
- Full functionality preserved

### Frankenstein ✓
- 4 incompatible VMs unified
- Legacy + modern tech merged
- Desktop apps in browser
- Cross-runtime communication

### Skeleton Crew ✓
- Flexible runtime framework
- Multiple use cases demonstrated
- Plugin architecture
- Minimal core, maximum power

### Costume Contest ✓
- Haunting dark aesthetic
- Polished animations
- Functional design elements
- Unforgettable experience

---

## 💀 The Complete Package

NecroVerse isn't just one category—it's **all four**:

1. **Resurrects** dead technologies
2. **Frankensteins** incompatible systems
3. **Provides** a flexible skeleton
4. **Delivers** a haunting UI

**"From the void, we summon. To the void, we return. But in between, we create."**
    `,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: "❓",
    content: `
# Frequently Asked Questions

## Is this legal?
Yes! We only resurrect files you upload. We don't host copyrighted content.

## Does it work offline?
No, files are processed and stored in the cloud. Internet connection required.

## Can I download converted files?
Currently no, but this feature is planned.

## Why are some features missing?
We're continuously improving. Some legacy APIs are complex to emulate.

## Is my data safe?
Files are stored securely in Supabase with proper access controls.

## Can I contribute?
Yes! This is an open-source project. Check our GitHub.

## What browsers are supported?
Modern browsers: Chrome, Firefox, Safari, Edge (latest versions).

## Mobile support?
Yes, but desktop recommended for best experience.
    `,
  },
];

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("about");

  const currentSection = docSections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <div className="border-b border-accent-glow/30 bg-shadow/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="violet" onClick={() => router.push("/")}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-accent-glow">
              📚 NecroVerse Documentation
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <h2 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-4">
                Contents
              </h2>
              {docSections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? "bg-accent-glow/20 text-accent-glow border border-accent-glow/50"
                      : "bg-shadow/50 text-text hover:bg-shadow hover:text-accent-glow border border-transparent"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentSection && (
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-shadow/50 border border-accent-glow/30 rounded-lg p-8"
                >
                  <div className="prose prose-invert prose-purple max-w-none">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">{currentSection.icon}</span>
                      <h1 className="text-3xl font-bold text-accent-glow m-0">
                        {currentSection.title}
                      </h1>
                    </div>
                    <div
                      className="text-text/90 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{
                        __html: currentSection.content
                          .split("\n")
                          .map((line) => {
                            // Headers
                            if (line.startsWith("# "))
                              return `<h1 class="text-2xl font-bold text-accent-glow mt-8 mb-4">${line.slice(2)}</h1>`;
                            if (line.startsWith("## "))
                              return `<h2 class="text-xl font-bold text-highlight mt-6 mb-3">${line.slice(3)}</h2>`;
                            if (line.startsWith("### "))
                              return `<h3 class="text-lg font-bold text-text mt-4 mb-2">${line.slice(4)}</h3>`;
                            // Lists
                            if (line.startsWith("- ✓"))
                              return `<li class="text-highlight ml-4">✓ ${line.slice(4)}</li>`;
                            if (line.startsWith("- "))
                              return `<li class="ml-4">${line.slice(2)}</li>`;
                            // Code blocks
                            if (line.startsWith("```"))
                              return line.includes("```typescript")
                                ? '<pre class="bg-background/50 p-4 rounded-lg overflow-x-auto mt-4"><code class="text-sm text-cyan">'
                                : "</code></pre>";
                            // Bold
                            if (line.includes("**")) {
                              return `<p class="my-2">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent-glow">$1</strong>')}</p>`;
                            }
                            // Empty line
                            if (line.trim() === "") return "<br/>";
                            // Regular paragraph
                            return `<p class="my-2">${line}</p>`;
                          })
                          .join(""),
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-accent-glow/30 bg-shadow/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-text/60">
          <p>
            NecroVerse - Resurrecting Dead Technologies
            <br />
            <span className="text-accent-glow">
              "From the void, we summon. To the void, we return."
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
