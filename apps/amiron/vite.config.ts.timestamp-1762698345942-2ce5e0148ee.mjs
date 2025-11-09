// vite.config.ts
import { defineConfig } from "file:///C:/Users/f0x17/OneDrive/Desktop/UDK/NecroVerse/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.24/node_modules/vite/dist/node/index.js";
import wasm from "file:///C:/Users/f0x17/OneDrive/Desktop/UDK/NecroVerse/node_modules/.pnpm/vite-plugin-wasm@3.5.0_vite@5.4.21/node_modules/vite-plugin-wasm/exports/import.mjs";
import topLevelAwait from "file:///C:/Users/f0x17/OneDrive/Desktop/UDK/NecroVerse/node_modules/.pnpm/vite-plugin-top-level-await@1.6.0_vite@5.4.21/node_modules/vite-plugin-top-level-await/exports/import.mjs";
var vite_config_default = defineConfig({
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  // Development server configuration
  server: {
    port: 3003,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  // Build configuration
  build: {
    target: "esnext",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    // Optimize bundle size
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        // Keep console for debugging
        drop_debugger: true
      }
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": ["@amiron/intuition", "@amiron/pal", "@amiron/ritual-api", "@amiron/workbench"],
          "apps": ["./src/apps/text-editor", "./src/apps/file-manager", "./src/apps/terminal"]
        }
      }
    }
  },
  // Dependency optimization
  optimizeDeps: {
    exclude: ["@amiron/exec"],
    // Exclude WASM module from pre-bundling
    include: [
      "@amiron/intuition",
      "@amiron/pal",
      "@amiron/ritual-api",
      "@amiron/workbench"
    ],
    force: true
    // Force re-optimization on every dev server start
  },
  // Base path for deployment (can be overridden via env var)
  base: process.env.VITE_BASE_PATH || "/",
  // Asset handling
  assetsInclude: ["**/*.wasm"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmMHgxN1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFVES1xcXFxOZWNyb1ZlcnNlXFxcXGFwcHNcXFxcYW1pcm9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmMHgxN1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFVES1xcXFxOZWNyb1ZlcnNlXFxcXGFwcHNcXFxcYW1pcm9uXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9mMHgxNy9PbmVEcml2ZS9EZXNrdG9wL1VESy9OZWNyb1ZlcnNlL2FwcHMvYW1pcm9uL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nO1xyXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB3YXNtKCksXHJcbiAgICB0b3BMZXZlbEF3YWl0KCksXHJcbiAgXSxcclxuICBcclxuICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgY29uZmlndXJhdGlvblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMyxcclxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IHRydWUsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gQnVpbGQgY29uZmlndXJhdGlvblxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgXHJcbiAgICAvLyBPcHRpbWl6ZSBidW5kbGUgc2l6ZVxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IGZhbHNlLCAvLyBLZWVwIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBDaHVuayBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3ZlbmRvcic6IFsnQGFtaXJvbi9pbnR1aXRpb24nLCAnQGFtaXJvbi9wYWwnLCAnQGFtaXJvbi9yaXR1YWwtYXBpJywgJ0BhbWlyb24vd29ya2JlbmNoJ10sXHJcbiAgICAgICAgICAnYXBwcyc6IFsnLi9zcmMvYXBwcy90ZXh0LWVkaXRvcicsICcuL3NyYy9hcHBzL2ZpbGUtbWFuYWdlcicsICcuL3NyYy9hcHBzL3Rlcm1pbmFsJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBcclxuICAvLyBEZXBlbmRlbmN5IG9wdGltaXphdGlvblxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogWydAYW1pcm9uL2V4ZWMnXSwgLy8gRXhjbHVkZSBXQVNNIG1vZHVsZSBmcm9tIHByZS1idW5kbGluZ1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAnQGFtaXJvbi9pbnR1aXRpb24nLFxyXG4gICAgICAnQGFtaXJvbi9wYWwnLFxyXG4gICAgICAnQGFtaXJvbi9yaXR1YWwtYXBpJyxcclxuICAgICAgJ0BhbWlyb24vd29ya2JlbmNoJyxcclxuICAgIF0sXHJcbiAgICBmb3JjZTogdHJ1ZSwgLy8gRm9yY2UgcmUtb3B0aW1pemF0aW9uIG9uIGV2ZXJ5IGRldiBzZXJ2ZXIgc3RhcnRcclxuICB9LFxyXG4gIFxyXG4gIC8vIEJhc2UgcGF0aCBmb3IgZGVwbG95bWVudCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIGVudiB2YXIpXHJcbiAgYmFzZTogcHJvY2Vzcy5lbnYuVklURV9CQVNFX1BBVEggfHwgJy8nLFxyXG4gIFxyXG4gIC8vIEFzc2V0IGhhbmRsaW5nXHJcbiAgYXNzZXRzSW5jbHVkZTogWycqKi8qLndhc20nXSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1gsU0FBUyxvQkFBb0I7QUFDL1ksT0FBTyxVQUFVO0FBQ2pCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLGNBQWM7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFHQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBO0FBQUEsSUFHWCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osVUFBVSxDQUFDLHFCQUFxQixlQUFlLHNCQUFzQixtQkFBbUI7QUFBQSxVQUN4RixRQUFRLENBQUMsMEJBQTBCLDJCQUEyQixxQkFBcUI7QUFBQSxRQUNyRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBO0FBQUEsSUFDeEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdBLE1BQU0sUUFBUSxJQUFJLGtCQUFrQjtBQUFBO0FBQUEsRUFHcEMsZUFBZSxDQUFDLFdBQVc7QUFDN0IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
