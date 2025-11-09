import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
  
  // Development server configuration
  server: {
    port: 3003,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
  
  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['@amiron/intuition', '@amiron/pal', '@amiron/ritual-api', '@amiron/workbench'],
          'apps': ['./src/apps/text-editor', './src/apps/file-manager', './src/apps/terminal'],
        },
      },
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    exclude: ['@amiron/exec'], // Exclude WASM module from pre-bundling
    include: [
      '@amiron/intuition',
      '@amiron/pal',
      '@amiron/ritual-api',
      '@amiron/workbench',
    ],
    force: true, // Force re-optimization on every dev server start
  },
  
  // Base path for deployment (can be overridden via env var)
  base: process.env.VITE_BASE_PATH || '/',
  
  // Asset handling
  assetsInclude: ['**/*.wasm'],
});
