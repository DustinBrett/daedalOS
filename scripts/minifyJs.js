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

const workerRegEx =
  /new Worker\(\w+\.\w+\(new URL\(\w+\.\w+\+\w+\.\w+\(\d+\),\w+\.\w+\)\),\{name:"([\w\s]+)"\}\)/;

const inlineIndexWorkers = (code) => {
  const [, workerName] = code.match(workerRegEx) || [];

  if (workerName) {
    const workerFilename = readdirSync(
      join(OUT_PATH, "_next/static/chunks")
    ).find((entry) => entry.startsWith(`${workerName}.`));

    if (!workerFilename) {
      throw new Error(`Worker file not found for '${workerName}'`);
    }

    const workerSource = readFileSync(
      join(OUT_PATH, "_next/static/chunks", workerFilename)
    );
    const base64Worker = Buffer.from(workerSource).toString("base64");

    return code.replace(
      workerRegEx,
      `new Worker("data:application/javascript;base64,${base64Worker}",{name:"${workerName}"})`
    );
  }

  return code;
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
        let { code: minifiedJs, error } = await minify(
          js.toString(),
          JS_MINIFIER_CONFIG
        );

        if (!error && minifiedJs?.length > 0) {
          if (entry.startsWith("index-")) {
            const changedCode = inlineIndexWorkers(minifiedJs);

            if (minifiedJs === changedCode) {
              throw new Error("Inlining worker failed!");
            }

            minifiedJs = changedCode;
          }

          writeFileSync(fullPath, minifiedJs);
        }
      }
    })
  );

minifyJsFiles(OUT_PATH);
