# @amiron/exec

The Exec Layer - Amiron's microkernel-inspired task management system compiled to WebAssembly.

## Building

```bash
pnpm build
```

This compiles the Rust code to WebAssembly using wasm-pack.

## Features

- Preemptive multitasking with priority-based scheduling
- Message-passing between tasks
- Isolated task memory spaces
- WebAssembly for near-native performance
