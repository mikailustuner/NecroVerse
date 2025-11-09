/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@necroverse/ui", "@necroverse/graveyard-runtime"],
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

