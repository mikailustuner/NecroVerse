# Architecture

## Overview

Necroverse is a full-stack application for preserving and running legacy file formats in modern browsers. The architecture consists of several key components:

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   NecroDev   │  │  NecroPlay   │  │     UI        │     │
│  │  (Upload)    │  │  (Player)    │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Graveyard Runtime (Core Engine)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Parsers    │  │   Engines    │  │  Renderers   │     │
│  │  - SWF       │  │  - SWF       │  │  - Canvas    │     │
│  │  - JAR       │  │  - JVM       │  │  - WebGL     │     │
│  │  - XAP       │  │  - AS        │  │              │     │
│  │  - DCR       │  │  - Lingo     │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Converters  │  │   Utils      │  │  Analytics   │     │
│  │  - SWF→HTML  │  │  - Network   │  │  - Tracking  │     │
│  │  - JAR→WASM  │  │  - Storage   │  │  - Metrics   │     │
│  │  - XAP→HTML  │  │  - Memory    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Supabase)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Database   │  │   Storage    │  │   Auth       │     │
│  │  - Files     │  │  - Uploads   │  │  - Users     │     │
│  │  - Logs      │  │  - Exports   │  │  - Sessions  │     │
│  │  - Comments  │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Runtime Engines

Each runtime engine follows a similar pattern:

1. **Parser**: Parses the file format into an internal representation
2. **Engine**: Executes the parsed content
3. **Renderer**: Renders the output to canvas

### SWF Engine Flow

```
SWF File → SWF Parser → SWF Engine → ActionScript Interpreter → Canvas Renderer
```

### JVM Engine Flow

```
JAR File → JAR Parser → JVM Interpreter → Canvas Renderer
```

### XAP Engine Flow

```
XAP File → XAP Parser → XAML Parser → Silverlight Renderer → Canvas Renderer
```

### DCR Engine Flow

```
DCR File → DCR Parser → DCR Engine → Lingo Interpreter → Canvas Renderer
```

## Data Flow

1. **Upload**: User uploads file → NecroDev → Supabase Storage
2. **Conversion**: File → Parser → Converter → Metadata → Database
3. **Playback**: File ID → Database → Storage → Parser → Engine → Renderer → Canvas
4. **Analytics**: Events → Analytics Manager → Database → Dashboard

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Runtime**: Custom interpreters (JVM, ActionScript, Lingo)
- **Rendering**: HTML5 Canvas, WebGL
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Testing**: Vitest, Playwright
- **Build**: Turbo, pnpm

