const { createHash } = require("crypto");
const {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
} = require("fs");
const { basename, extname, join, relative } = require("path");
const { author, description } = require("../package.json");

const BLOG_EXTENSION = ".whtml";
const PUBLIC_PATH = "public";

const feedFiles = [];

const getFeedFiles = (path) =>
  existsSync(path) &&
  readdirSync(path).forEach((entry) => {
    const fullPath = join(path, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      getFeedFiles(fullPath);
    } else if (extname(entry).toLowerCase() === BLOG_EXTENSION) {
      feedFiles.push([fullPath, stats]);
    }
  });

let lastBuildDate;

const createRssFeedItems = (url) => {
  feedFiles.length = 0;
  getFeedFiles(join(PUBLIC_PATH, url));
  feedFiles.sort(([, aStats], [, bStats]) => bStats.mtimeMs - aStats.mtimeMs);

  lastBuildDate = feedFiles?.[0]?.[1]?.mtime.toUTCString();

  return feedFiles.map(([link, stats]) => {
    const fileData = readFileSync(link);
    const fileDataString = fileData.toString("utf8");
    const itemDescription = fileDataString
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .substring(0, 100)
      .trim();

    return [
      "<item>",
      `<title>${basename(link, BLOG_EXTENSION)}</title>`,
      `<link>${encodeURI(`${author.url}/?url=${relative(PUBLIC_PATH, link).replace(/\\/g, "/")}`)}</link>`,
      `<description>${itemDescription}${fileDataString.trim().length > 100 ? "..." : ""}</description>`,
      `<guid isPermaLink="false">${createHash("md5").update(fileData).digest("hex")}</guid>`,
      `<pubDate>${stats.mtime.toUTCString()}</pubDate>`,
      "</item>",
    ].join("");
  });
};

const name = "daedalOS";
const rss = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">',
  "<channel>",
  `<atom:link href="${author.url}/rss.xml" rel="self" type="application/rss+xml" />`,
  `<title>${name}</title>`,
  `<link>${author.url}</link>`,
  `<description>${description}</description>`,
  `<lastBuildDate>${lastBuildDate || new Date().toUTCString()}</lastBuildDate>`,
  ...createRssFeedItems("Users/Public/Documents/Blog Posts"),
  "</channel>",
  "</rss>",
].join("");

writeFileSync(join(PUBLIC_PATH, "rss.xml"), rss, { flag: "w" });
