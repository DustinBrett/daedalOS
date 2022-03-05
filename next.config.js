// @ts-check

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  compiler: {
    reactRemoveProperties: true,
    removeConsole: {
      exclude: ["log"],
    },
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
  swcMinify: true,
};

module.exports = nextConfig;
