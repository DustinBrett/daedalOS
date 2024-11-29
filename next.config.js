// @ts-check
const isProduction = process.env.NODE_ENV === "production";
const webpack = require("webpack");

/**
 * @type {import("next").NextConfig}
 * */
const nextConfig = {
  output: "export", // Required for static export
  reactStrictMode: true,
  webpack: (config) => {
    // Your custom webpack configuration
    return config;
  },
};

module.exports = nextConfig;