const { readdirSync, readFileSync, statSync, writeFileSync } = require("fs");
const { basename, extname, join } = require("path");
const lunr = require("lunr");

const PUBLIC_PATH = "public";
const SEARCH_EXTENSIONS = require("./searchExtensions.json");
const IGNORE_FILES = new Set([
  "desktop.ini",
  "favicon.ico",
  "fs.9p.json",
  "preload.json",
  "robots.txt",
  "search.lunr.json",
  "sitemap.xml",
]);
const IGNORE_PATHS = [
  ".index",
  "Program Files",
  "System",
  "Users/Public/Icons",
  "Users/Public/Pictures/Blog",
];

const indexData = [];

const createSearchIndex = (path) => {
  readdirSync(path).forEach((entry) => {
    if (
      IGNORE_PATHS.some((ignoredPath) =>
        path.startsWith(join(PUBLIC_PATH, ignoredPath))
      )
    ) {
      return;
    }

    const fullPath = join(path, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      createSearchIndex(fullPath);
    } else if (
      !IGNORE_FILES.has(entry) &&
      !SEARCH_EXTENSIONS.ignore.includes(extname(entry).toLowerCase())
    ) {
      const keyPath = fullPath.replace(/\\/g, "/").replace(PUBLIC_PATH, "");

      indexData.push({
        name: basename(keyPath, extname(keyPath)),
        path: keyPath,
        text: SEARCH_EXTENSIONS.index.includes(extname(entry).toLowerCase())
          ? readFileSync(fullPath, "utf8")
              .replace(/\r?\n|\r/g, " ")
              .replace(/<\/?[^>]+(>|$)/g, "")
          : undefined,
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
