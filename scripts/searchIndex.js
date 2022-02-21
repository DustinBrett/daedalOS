const { readdirSync, readFileSync, statSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const lunr = require("lunr");

const PUBLIC_PATH = "public";
const INDEX_EXTENSIONS = new Set([".md", ".whtml"]);
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
      !IGNORE_PATHS.some((ignoredPath) =>
        fullPath.startsWith(join(PUBLIC_PATH, ignoredPath))
      )
    ) {
      indexData.push({
        name: fullPath.replace(/\\/g, "/").replace(PUBLIC_PATH, ""),
        text: INDEX_EXTENSIONS.has(extname(entry))
          ? readFileSync(fullPath, "utf8")
          : entry,
      });
    }
  });
};

createSearchIndex(PUBLIC_PATH);

const searchIndex = lunr(function () {
  this.ref("name");
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
