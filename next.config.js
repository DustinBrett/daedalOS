// @ts-check

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  compiler: {
    reactRemoveProperties: true,
    removeConsole: true,
    styledComponents: true,
  },
  experimental: {
    reactRoot: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
