const { readdirSync, readFileSync, statSync, writeFileSync } = require("fs");
const { minify } = require("terser");
const { extname, join } = require("path");

const OUT_PATH = "out";

const JS_MINIFIER_CONFIG = {
  compress: true,
  ecma: 2021,
  mangle: true,
  output: {
    comments: false,
  },
  sourceMap: false,
};

const minifyJsFiles = (path) =>
  Promise.all(
    readdirSync(path).map(async (entry) => {
      const fullPath = join(path, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        minifyJsFiles(fullPath);
      } else if (extname(entry).toLowerCase() === ".js") {
        const js = readFileSync(fullPath);
        const { code: minifiedJs, error } = await minify(
          js.toString(),
          JS_MINIFIER_CONFIG
        );

        if (!error && minifiedJs?.length > 0) {
          writeFileSync(fullPath, minifiedJs);
        }
      }
    })
  );

minifyJsFiles(OUT_PATH);
