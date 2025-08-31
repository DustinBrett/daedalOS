const { mkdir, readdir, readlink, stat, writeFile } = require("fs");
const { basename, dirname, join, resolve: resolvePath } = require("path");

const VERSION = 4;

const IDX_NAME = 0;
const IDX_SIZE = 1;
const IDX_MTIME = 2;
const IDX_TARGET = 3;

const args = process.argv.slice(2);
const argPath = resolvePath(args[args.length - 1]);
let excludedPaths = [];
let outputPath = "";

args.forEach((arg, index) => {
  if (arg === "--exclude") excludedPaths = args[index + 1].split(",");
  if (arg === "--out") outputPath = resolvePath(args[index + 1]);
});

const fs2json = (dir) => {
  let totalSize = 0;

  const makeNode = (st, name) => {
    const obj = [];

    obj[IDX_NAME] = name;
    obj[IDX_SIZE] = st.size;
    obj[IDX_MTIME] = Number(st.mtime);

    totalSize += st.size;

    return obj;
  };

  const walk = (walkDir) => {
    return new Promise((resolve, reject) => {
      const result = [];

      readdir(walkDir, (dirError, files) => {
        if (dirError) {
          reject(dirError);
          return;
        }

        const includedFiles =
          dir === walkDir
            ? files.filter((file) => !excludedPaths.includes(file))
            : files;

        const recur = () => {
          const file = includedFiles.shift();

          if (file) {
            const fullPath = join(walkDir, file);

            stat(fullPath, (statError, fileStat) => {
              if (statError) {
                reject(statError);
                return;
              }

              const name = basename(fullPath);
              const node = makeNode(fileStat, name);

              if (fileStat.isSymbolicLink()) {
                readlink(fullPath, (linkError, path) => {
                  if (!linkError) {
                    node[IDX_TARGET] = path;
                    result.push(node);
                    recur();
                  }
                });
              } else if (fileStat.isDirectory()) {
                walk(fullPath).then((rest) => {
                  node[IDX_TARGET] = rest;
                  result.push(node);
                  recur();
                });
              } else {
                result.push(node);
                recur();
              }
            });
          } else {
            resolve(result);
          }
        };

        recur();
      });
    });
  };

  console.info("Creating file tree ...");

  return walk(dir).then((data) => {
    console.info("Creating json ...");

    mkdir(dirname(outputPath), { recursive: true }, () =>
      writeFile(
        outputPath,
        JSON.stringify({
          fsroot: data,
          size: totalSize,
          version: VERSION,
        }),
        () => process.exit()
      )
    );
  });
};

fs2json(resolvePath(argPath));
