// @ts-check
const isProduction = process.env.NODE_ENV === "production";
const webpack = require("webpack");

/**
 * @type {import("next").NextConfig}
 * */
const nextConfig = {
  output: "export", // Required for static export
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Disable Hot Module Replacement (HMR)
    if (!isProduction) {
      config.devServer = {
        hot: false, // Disable HMR
      };
    }

    return config; // Return the modified config
  },
};

module.exports = nextConfig;