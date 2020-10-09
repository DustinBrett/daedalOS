/* eslint @typescript-eslint/no-var-requires: off */
const fs = require('fs');

const cwd = process.cwd();

const getFileData = (filePath) => {
  const { size, mtime } = fs.statSync(filePath);

  return {
    size,
    mtime: new Date(mtime)
  };
};

const parseDirectory = (index, sourcePath = cwd) => {
  return Object.keys(index).reduce((acc, entry) => {
    const filePath = `${sourcePath}/${entry}`;

    return {
      ...acc,
      ...(index[entry]
        ? parseDirectory(index[entry], filePath)
        : { [filePath.replace(cwd, '')]: getFileData(filePath) })
    };
  }, {});
};

const { argv: [, , fileArg, saveFileArg] = [] } = process || {};

fs.writeFileSync(
  saveFileArg || fileArg,
  JSON.stringify(
    parseDirectory(
      JSON.parse(fs.readFileSync(fileArg || 'index.json').toString())
    )
  )
);
