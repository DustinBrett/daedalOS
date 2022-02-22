const { readdirSync, readFileSync, statSync, writeFileSync } = require("fs");
const { basename, extname, join } = require("path");
const lunr = require("lunr");

const PUBLIC_PATH = "public";
const INDEX_EXTENSIONS = require("./indexExtensions.json");
const IGNORE_EXTENSIONS = new Set([".url"]);
const IGNORE_FILES = new Set([
  "desktop.ini",
  "favicon.ico",
  "fs.9p.json",
  "fs.bfs.json",
  "robots.txt",
]);
const IGNORE_PATHS = ["Program Files", "System", "Users/Public/Icons"];

const indexData = [];

const createSearchIndex = (path) => {
  readdirSync(path).forEach((entry) => {
    const fullPath = join(path, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      createSearchIndex(fullPath);
    } else if (
      !IGNORE_FILES.has(entry) &&
      !IGNORE_EXTENSIONS.has(extname(entry)) &&
      !IGNORE_PATHS.some((ignoredPath) =>
        fullPath.startsWith(join(PUBLIC_PATH, ignoredPath))
      )
    ) {
      const path = fullPath.replace(/\\/g, "/").replace(PUBLIC_PATH, "");
      indexData.push({
        path,
        name: basename(path, extname(path)),
        text: INDEX_EXTENSIONS.includes(extname(entry))
          ? readFileSync(fullPath, "utf8")
          : entry,
      });
    }
  });
};

createSearchIndex(PUBLIC_PATH);

const searchIndex = lunr(function () {
  this.ref("path");
  this.field("name");
  this.field("text");

  indexData.forEach((doc) => this.add(doc));
});

writeFileSync(
  join(PUBLIC_PATH, ".index/search.lunr.json"),
  JSON.stringify(searchIndex.toJSON()),
  {
    flag: "w",
  }
);
