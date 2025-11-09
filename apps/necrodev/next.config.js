/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages için static export
  output: process.env.NEXT_EXPORT ? 'export' : undefined,
  // GitHub Pages için basePath (repo adına göre ayarlanabilir)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // GitHub Pages için trailingSlash
  trailingSlash: true,
  transpilePackages: ["@necroverse/ui", "@necroverse/graveyard-runtime"],
  // Ignore TypeScript errors during build (allows build to continue with type errors)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // GitHub Pages için assetPrefix - basePath ile aynı olmalı
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ui": path.resolve(__dirname, "../../packages/ui/src/index"),
      "@ui/*": path.resolve(__dirname, "../../packages/ui/src/*"),
      "@graveyard-runtime/*": path.resolve(__dirname, "../../packages/graveyard-runtime/src/*"),
    };
    return config;
  },
};

module.exports = nextConfig;

