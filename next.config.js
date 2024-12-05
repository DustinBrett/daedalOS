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
    // https://webcheckin.fd.economysoftware.com.br/81/14690?idt=2
    return config;
  },
};

module.exports = nextConfig;