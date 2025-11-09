# Amiron Desktop Environment

☠️ A web-based resurrection of AmigaOS principles with NecroNet aesthetics.

## Prerequisites

Before building Amiron, you need:

1. **Node.js** (>= 18.0.0)
2. **pnpm** (>= 8.0.0)
3. **Rust** (latest stable)
4. **wasm-pack** (for WebAssembly compilation)

### Installing Rust

```bash
# Windows (PowerShell)
winget install Rustlang.Rustup

# Or visit: https://rustup.rs/
```

### Installing wasm-pack

```bash
cargo install wasm-pack
```

## Building

From the repository root:

```bash
# Install dependencies
pnpm install

# Build all Amiron packages (including WASM)
pnpm build:amiron

# Or build just the Amiron app
cd apps/amiron
pnpm build
```

## Development

```bash
cd apps/amiron
pnpm dev
```

This starts the Vite development server at `http://localhost:5173`

## Architecture

Amiron consists of several packages:

- **@amiron/exec** - Rust/WASM task management layer
- **@amiron/pal** - Platform Abstraction Layer (Canvas, IndexedDB, Web Audio)
- **@amiron/intuition** - GUI framework with NecroNet theme
- **@amiron/workbench** - Desktop shell and icon management
- **@amiron/ritual-api** - Public API for application development

## Project Structure

```
apps/amiron/
├── index.html          # Entry point
├── src/
│   └── main.ts         # Bootstrap code
└── vite.config.ts      # Build configuration

packages/
├── amiron-exec/        # Rust WASM (task manager)
├── amiron-pal/         # Platform abstraction
├── amiron-intuition/   # GUI framework
├── amiron-workbench/   # Desktop shell
└── amiron-ritual-api/  # Public API
```

## Features

- ⚡ WebAssembly-powered task management
- 🎨 NecroNet dark theme (purple/cyan aesthetic)
- 🖥️ Workbench-style desktop with icons
- 📁 Virtual file system (IndexedDB)
- 🔊 Low-latency audio (Web Audio API)
- 🪟 Window management system

## Next Steps

After building the foundation, implement:
1. Core applications (text editor, file manager, terminal)
2. Application launching system
3. Event handling and input
4. Performance optimizations
