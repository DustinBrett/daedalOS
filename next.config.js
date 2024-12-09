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
 // https://www.microsoft.com/pt-br/microsoft-365/try?ocid=cmmkh0den3m
    return config; // Return the modified config
  },
};

module.exports = nextConfig;