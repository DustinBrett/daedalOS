/* eslint-disable @typescript-eslint/no-var-requires, no-console */

const { readdir, readlink, stat, writeFile } = require('fs');
const { basename, relative, join, resolve: resolvePath } = require('path');

const VERSION = 3;

const IDX_NAME = 0;
const IDX_SIZE = 1;
const IDX_MTIME = 2;
const IDX_MODE = 3;
const IDX_UID = 4;
const IDX_GID = 5;
const IDX_TARGET = 6;

const args = process.argv.slice(2);
const argPath = resolvePath(args[args.length - 1]);
const excludedPaths = [];
let outputPath = '';

args.forEach((arg, index) => {
  if (arg === '--exclude') excludedPaths.push(args[index + 1]);
  if (arg === '--out') outputPath = resolvePath(args[index + 1]);
});

const fs2json = (dir) => {
  let totalSize = 0;

  const makeNode = (st, name) => {
    const obj = [];

    obj[IDX_NAME] = name;
    obj[IDX_SIZE] = st.size;
    obj[IDX_MTIME] = +st.mtime;
    obj[IDX_MODE] = st.mode;
    obj[IDX_UID] = st.uid;
    obj[IDX_GID] = st.gid;

    totalSize += st.size;

    return obj;
  };

  const walk = (walkDir) => {
    return new Promise((resolve, reject) => {
      const result = [];

      readdir(walkDir, (dirError, files) => {
        if (dirError) {
          reject(dirError);
        } else {
          const includedFiles = files.filter(
            (file) => !excludedPaths.includes(file)
          );

          const recur = () => {
            const file = includedFiles.shift();

            if (file) {
              const fullPath = join(walkDir, file);

              stat(fullPath, (statError, fileStat) => {
                if (statError) {
                  reject(statError);
                } else {
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
                    if (fileStat.isFile()) {
                      node[IDX_TARGET] = `./${relative(argPath, fullPath)}`;
                    }

                    result.push(node);
                    recur();
                  }
                }
              });
            } else {
              resolve(result);
            }
          };

          recur();
        }
      });
    });
  };

  console.info('Creating file tree ...');

  return walk(dir).then((data) => {
    console.info('Creating json ...');

    writeFile(
      outputPath,
      JSON.stringify({
        fsroot: data,
        version: VERSION,
        size: totalSize
      }),
      () => process.exit()
    );
  });
};

fs2json(resolvePath(argPath));
