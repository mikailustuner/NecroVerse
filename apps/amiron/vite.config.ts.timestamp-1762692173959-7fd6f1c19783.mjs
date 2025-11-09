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
    port: 3002,
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
    ]
  },
  // Base path for deployment (can be overridden via env var)
  base: process.env.VITE_BASE_PATH || "/",
  // Asset handling
  assetsInclude: ["**/*.wasm"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmMHgxN1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFVES1xcXFxOZWNyb1ZlcnNlXFxcXGFwcHNcXFxcYW1pcm9uXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmMHgxN1xcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFVES1xcXFxOZWNyb1ZlcnNlXFxcXGFwcHNcXFxcYW1pcm9uXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9mMHgxNy9PbmVEcml2ZS9EZXNrdG9wL1VESy9OZWNyb1ZlcnNlL2FwcHMvYW1pcm9uL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nO1xyXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB3YXNtKCksXHJcbiAgICB0b3BMZXZlbEF3YWl0KCksXHJcbiAgXSxcclxuICBcclxuICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgY29uZmlndXJhdGlvblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMixcclxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IHRydWUsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gQnVpbGQgY29uZmlndXJhdGlvblxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgXHJcbiAgICAvLyBPcHRpbWl6ZSBidW5kbGUgc2l6ZVxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IGZhbHNlLCAvLyBLZWVwIGNvbnNvbGUgZm9yIGRlYnVnZ2luZ1xyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBDaHVuayBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3ZlbmRvcic6IFsnQGFtaXJvbi9pbnR1aXRpb24nLCAnQGFtaXJvbi9wYWwnLCAnQGFtaXJvbi9yaXR1YWwtYXBpJywgJ0BhbWlyb24vd29ya2JlbmNoJ10sXHJcbiAgICAgICAgICAnYXBwcyc6IFsnLi9zcmMvYXBwcy90ZXh0LWVkaXRvcicsICcuL3NyYy9hcHBzL2ZpbGUtbWFuYWdlcicsICcuL3NyYy9hcHBzL3Rlcm1pbmFsJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBcclxuICAvLyBEZXBlbmRlbmN5IG9wdGltaXphdGlvblxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXhjbHVkZTogWydAYW1pcm9uL2V4ZWMnXSwgLy8gRXhjbHVkZSBXQVNNIG1vZHVsZSBmcm9tIHByZS1idW5kbGluZ1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAnQGFtaXJvbi9pbnR1aXRpb24nLFxyXG4gICAgICAnQGFtaXJvbi9wYWwnLFxyXG4gICAgICAnQGFtaXJvbi9yaXR1YWwtYXBpJyxcclxuICAgICAgJ0BhbWlyb24vd29ya2JlbmNoJyxcclxuICAgIF0sXHJcbiAgfSxcclxuICBcclxuICAvLyBCYXNlIHBhdGggZm9yIGRlcGxveW1lbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBlbnYgdmFyKVxyXG4gIGJhc2U6IHByb2Nlc3MuZW52LlZJVEVfQkFTRV9QQVRIIHx8ICcvJyxcclxuICBcclxuICAvLyBBc3NldCBoYW5kbGluZ1xyXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi53YXNtJ10sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtYLFNBQVMsb0JBQW9CO0FBQy9ZLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxjQUFjO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQTtBQUFBLElBR1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFVBQVUsQ0FBQyxxQkFBcUIsZUFBZSxzQkFBc0IsbUJBQW1CO0FBQUEsVUFDeEYsUUFBUSxDQUFDLDBCQUEwQiwyQkFBMkIscUJBQXFCO0FBQUEsUUFDckY7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQTtBQUFBLElBQ3hCLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxRQUFRLElBQUksa0JBQWtCO0FBQUE7QUFBQSxFQUdwQyxlQUFlLENBQUMsV0FBVztBQUM3QixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
