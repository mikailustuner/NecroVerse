/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  // Ayrı Netlify sitesi olarak deploy edilecek, basePath gerekmez
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  transpilePackages: ["@necroverse/ui", "@necroverse/graveyard-runtime"],
  // Ignore TypeScript errors during build (allows build to continue with type errors)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
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

