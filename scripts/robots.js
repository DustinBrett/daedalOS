const { readdirSync, statSync, writeFileSync } = require("fs");
const { extname, join } = require("path");
const { author } = require("../package.json");

const xmlUrls = [];

const buildAppSitemap = (path) => {
  readdirSync(path).forEach((entry) => {
    if (statSync(join(path, entry)).isDirectory()) {
      xmlUrls.push(
        `<url><loc>${author.url}/?app=${entry.replace(/-/g, "")}</loc></url>`
      );
    }
  });
};

const buildFileSitemap = (path, excludePaths, callback) => {
  const publicPath = join("public/", path);

  readdirSync(publicPath).forEach((entry) => {
    const entryPath = join(path, entry);
    const urlEntryPath = entryPath.replace(/\\/g, "/");
    const stats = statSync(join(publicPath, entry));

    if (stats.isDirectory()) {
      if (!excludePaths.includes(urlEntryPath)) {
        buildFileSitemap(entryPath, excludePaths, callback);
      }
    } else if (![".ini", ".url"].includes(extname(entry).toLowerCase())) {
      const encodedUrlEntryPath = encodeURI(urlEntryPath).replace(/'/g, "%27");

      xmlUrls.push(
        callback(
          `${author.url}/?url=${encodedUrlEntryPath}`,
          new Date(stats.mtime - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .substring(0, 10),
          `${author.url}/${encodedUrlEntryPath}`
        )
      );
    }
  });
};

buildAppSitemap("components/apps");

buildFileSitemap(
  "Users/Public/Documents",
  [],
  (path, mtime) => `<url><loc>${path}</loc><lastmod>${mtime}</lastmod></url>`
);

buildFileSitemap(
  "Users/Public/Pictures",
  ["Users/Public/Pictures/Blog"],
  (path, mtime, url) =>
    `<url><loc>${path}</loc><image:image><image:loc>${url}</image:loc></image:image><lastmod>${mtime}</lastmod></url>`
);

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${xmlUrls.join(
    ""
  )}</urlset>`,
  {
    flag: "w",
  }
);

writeFileSync(
  "public/robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${author.url}/sitemap.xml\n`,
  {
    flag: "w",
  }
);
