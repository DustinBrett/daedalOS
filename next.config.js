// @ts-check

const isProduction = process.env.NODE_ENV === "production";

const bundleAnalyzer = process.env.npm_config_argv?.includes(
  "build:bundle-analyzer"
);

const path = require("path");
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
      ssr: true,
      transpileTemplateLiterals: true,
    },
  },
  devIndicators: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "credentialless",
        },
      ],
    },
  ],
  output: "export",
  productionBrowserSourceMaps: false,
  reactProductionProfiling: false,
  reactStrictMode: !isProduction,
  // These ship syntax newer than the browserslist targets (e.g. ??=, #private)
  transpilePackages: [
    "@ffmpeg/ffmpeg",
    "@jitl/quickjs-wasmfile-release-sync",
    "mediainfo.js",
    "multiformats",
    "prettier",
  ],
  webpack: (config) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        const mod = resource.request.replace(/^node:/, "");

        switch (mod) {
          case "buffer":
          case "module":
            resource.request = mod;
            break;
          case "stream":
            resource.request = "readable-stream";
            break;
          default:
            throw new Error(`Not found ${mod}`);
        }
      }),
      new webpack.DefinePlugin({
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "({ isDisabled: true })",
      })
    );

    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["MediaInfoModule.wasm"] = path.resolve(
      __dirname,
      "public/System/mediainfo.js/MediaInfoModule.wasm"
    );
    config.resolve.alias["ani-cursor/dist/parser"] = path.resolve(
      __dirname,
      "node_modules/ani-cursor/dist/parser.js"
    );

    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.module = false;
    config.resolve.fallback.perf_hooks = false;

    config.module.parser.javascript = config.module.parser.javascript || {};
    config.module.parser.javascript.dynamicImportFetchPriority = "high";

    config.module.rules.push(
      {
        include: path.resolve(__dirname, "node_modules/Burn-My-Windows"),
        test: /\.(frag|glsl|xml)$/,
        type: "asset/source",
      },
      {
        include: path.resolve(__dirname, "node_modules/stockfish/bin"),
        test: /\.(js|wasm)$/,
        type: "asset/resource",
      }
    );

    return config;
  },
};

module.exports = bundleAnalyzer
  ? require("@next/bundle-analyzer")({
      enabled: isProduction,
    })(nextConfig)
  : nextConfig;
