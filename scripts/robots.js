const { readdirSync, statSync, writeFileSync } = require("fs");
const { extname, join } = require("path");

const APPS_PATH = "..\\components\\apps";
const PUBLIC_PATH = "..\\public";
const INDEXED_FILE_TYPES = new Set([".md", ".whtml"]);

const indexData = [];

const createAppIndex = () => {
  readdirSync(APPS_PATH).forEach((entry) => {
    const stats = statSync(join(APPS_PATH, entry));

    if (stats.isDirectory()) {
      indexData.push(encodeURI(`/?app=${entry}`));
    }
  });
};

const createFileIndex = (path) => {
  readdirSync(path).forEach((entry) => {
    const stats = statSync(join(path, entry));

    if (stats.isDirectory()) {
      createFileIndex(join(path, entry));
    } else if (INDEXED_FILE_TYPES.has(extname(entry))) {
      indexData.push(
        encodeURI(
          `/?url=${join(path, entry)
            .replace(PUBLIC_PATH, "")
            .replace(/\\/g, "/")}`
        )
      );
    }
  });
};

createAppIndex();
createFileIndex(PUBLIC_PATH);

writeFileSync(join(PUBLIC_PATH, "robots.txt"), indexData.join("\n"), {
  flag: "w",
});
