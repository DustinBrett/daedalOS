// @ts-check

const isProduction = process.env.NODE_ENV === "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: isProduction,
});

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
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback.fs = false;

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
