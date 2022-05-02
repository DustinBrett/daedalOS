// @ts-check

const isProduction = process.env.NODE_ENV === "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: isProduction,
});

const webpack = require("webpack");

/**
 * @type {import("next").NextConfig}
 * */
const nextConfig = {
  compiler: {
    reactRemoveProperties: isProduction,
    removeConsole: isProduction,
    styledComponents: true,
  },
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    disablePostcssPresetEnv: true,
    reactRoot: true,
    swcFileReading: true,
  },
  optimizeFonts: false,
  reactStrictMode: true,
  swcMinify: !isProduction,
  webpack: (config) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");

        switch (mod) {
          case "buffer":
            resource.request = "buffer";
            break;
          case "stream":
            resource.request = "readable-stream";
            break;
          default:
            throw new Error(`Not found ${mod}`);
        }
      })
    );

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
