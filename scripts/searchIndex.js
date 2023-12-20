const {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  mkdirSync,
} = require("fs");
const { basename, extname, join } = require("path");
const { parse } = require("ini");
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

const normalizePath = (path) =>
  path.replace(/\\/g, "/").replace(PUBLIC_PATH, "");

const normalizeText = (text) =>
  text.replace(/\r?\n|\r/g, " ").replace(/<\/?[^>]+(>|$)/g, "");

const createSearchIndex = (path) => {
  const directoryContents = readdirSync(path);
  const normalizedPath = normalizePath(path);

  if (normalizedPath) {
    const name = basename(path);

    indexData.push({
      name,
      path: normalizedPath,
      text: normalizeText(
        [
          name,
          ...directoryContents.filter(
            (entry) => !statSync(join(path, entry)).isDirectory()
          ),
        ].join(" ")
      ),
    });
  }

  directoryContents.forEach((entry) => {
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
      const keyPath = normalizePath(fullPath);

      if (extname(entry).toLowerCase() === ".url") {
        const {
          InternetShortcut: { URL: url = "" },
        } = parse(readFileSync(fullPath).toString());

        if (url.length > 1 && url.startsWith("/")) {
          return;
        }
      }

      indexData.push({
        name: basename(keyPath, extname(keyPath)),
        path: keyPath,
        text: SEARCH_EXTENSIONS.index.includes(extname(entry).toLowerCase())
          ? normalizeText(readFileSync(fullPath, "utf8"))
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

if (!existsSync(join(PUBLIC_PATH, ".index"))) {
  mkdirSync(join(PUBLIC_PATH, ".index"));
}

writeFileSync(
  join(PUBLIC_PATH, ".index/search.lunr.json"),
  JSON.stringify(searchIndex.toJSON()),
  {
    flag: "w",
  }
);
