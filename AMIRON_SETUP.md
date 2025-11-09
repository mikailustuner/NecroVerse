# Amiron Setup Guide

☠️ **Resurrection Protocol: Amiron Desktop Environment**

## System Requirements

Amiron requires the following tools to be installed:

### 1. Rust Toolchain

The Exec layer is written in Rust and compiled to WebAssembly.

**Installation (Windows):**
```powershell
# Using winget
winget install Rustlang.Rustup

# Or download from https://rustup.rs/
```

**Verify installation:**
```bash
rustc --version
cargo --version
```

### 2. wasm-pack

Required for compiling Rust to WebAssembly targeting the web.

**Installation:**
```bash
cargo install wasm-pack
```

**Verify installation:**
```bash
wasm-pack --version
```

### 3. Node.js & pnpm

Already installed in this project.

## Build Order

The Amiron packages must be built in dependency order:

1. **@amiron/exec** (Rust → WASM) - No dependencies
2. **@amiron/pal** (TypeScript) - No dependencies
3. **@amiron/intuition** (TypeScript) - Depends on pal
4. **@amiron/workbench** (TypeScript) - Depends on pal, intuition
5. **@amiron/ritual-api** (TypeScript) - Depends on exec, pal, intuition
6. **amiron** (Vite app) - Depends on all packages

## Quick Start

Once Rust and wasm-pack are installed:

```bash
# From repository root
pnpm install

# Build all Amiron packages
pnpm build:amiron

# Start development server
cd apps/amiron
pnpm dev
```

## Manual Build Steps

If you need to build packages individually:

```bash
# 1. Build Exec (WASM)
cd packages/amiron-exec
pnpm build

# 2. Build PAL
cd ../amiron-pal
pnpm build

# 3. Build Intuition
cd ../amiron-intuition
pnpm build

# 4. Build Workbench
cd ../amiron-workbench
pnpm build

# 5. Build Ritual API
cd ../amiron-ritual-api
pnpm build

# 6. Build Amiron app
cd ../../apps/amiron
pnpm build
```

## Troubleshooting

### "rustc is not recognized"

Rust is not installed or not in PATH. Install Rust using the instructions above, then restart your terminal.

### "wasm-pack is not recognized"

wasm-pack is not installed. Run `cargo install wasm-pack` after installing Rust.

### Build errors in TypeScript packages

Make sure the Exec package is built first, as it generates TypeScript definitions that other packages depend on.

### Vite dev server errors

Ensure all packages are built before running the dev server. Run `pnpm build:amiron` from the root.

## Development Workflow

For active development:

1. Build WASM once: `cd packages/amiron-exec && pnpm build`
2. Start Vite dev server: `cd apps/amiron && pnpm dev`
3. TypeScript packages will be resolved via path aliases
4. Rebuild WASM only when changing Rust code

## Next Steps

After successful setup, you can:

- Open `http://localhost:5173` to see the Amiron desktop
- Implement core applications (Task 7 in tasks.md)
- Add desktop icons and application launching
- Develop custom applications using the Ritual API

---

*"The foundation is laid. The resurrection begins."*
