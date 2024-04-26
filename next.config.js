// @ts-check

const isProduction = process.env.NODE_ENV === "production";

const bundleAnalyzer = process.env.npm_config_argv?.includes(
  "build:bundle-analyzer"
);

const webpack = require("webpack");

/**
 * @type {import("next").NextConfig}
 * */
const nextConfig = {
  compiler: {
    reactRemoveProperties: isProduction,
    removeConsole: isProduction,
    styledComponents: {
      displayName: false,
      fileName: false,
      minify: isProduction,
      pure: true,
      ssr: false,
      transpileTemplateLiterals: true,
    },
  },
  devIndicators: {
    buildActivityPosition: "top-right",
  },
  optimizeFonts: false,
  output: "export",
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,
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

    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.module = false;
    config.resolve.fallback.perf_hooks = false;

    config.module.parser.javascript = config.module.parser.javascript || {};
    config.module.parser.javascript.dynamicImportFetchPriority = "high";

    return config;
  },
};

module.exports = bundleAnalyzer
  ? require("@next/bundle-analyzer")({
      enabled: isProduction,
    })(nextConfig)
  : nextConfig;
