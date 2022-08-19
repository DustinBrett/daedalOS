#!/usr/bin/env node
const dedent = require("dedent");
const ejs = require("ejs");
const fs = require("fs");
const glob = require("glob");
const hljs = require("highlight.js");
const mkdirp = require("mkdirp");
const path = require("path");
const postcss = require("postcss");

const { homepage, version } = require("./package.json");

function buildCSS() {
  const input =
    `/*! 98.css custom build - ${homepage} */\n` + fs.readFileSync("style.css");

  return postcss()
    .use(require("postcss-inline-svg"))
    // .use(require("postcss-css-variables"))
    // .use(require("postcss-calc"))
    .use(require("postcss-copy")({ dest: "dist", template: "[name].[ext]" }))
    // .use(require("cssnano"))
    .process(input, {
      from: "style.css",
      to: "dist/98.custom-build.css",
      map: { inline: false },
    })
    .then((result) => {
      mkdirp.sync("dist");
      fs.writeFileSync("dist/98.custom-build.css", result.css);
      fs.writeFileSync("dist/98.custom-build.css.map", result.map.toString());
    });
}

function buildDocs() {
  let id = 0;
  function getNewId() {
    return ++id;
  }
  function getCurrentId() {
    return id;
  }

  const template = fs.readFileSync("docs/index.html.ejs", "utf-8");
  function example(code) {
    const magicBrackets = /\[\[(.*)\]\]/g;
    const dedented = dedent(code);
    const inline = dedented.replace(magicBrackets, "$1");
    const escaped = hljs.highlight("html", dedented.replace(magicBrackets, ""))
      .value;

    return `<div class="example">
      ${inline}
      <details>
        <summary>Show code</summary>
        <pre><code>${escaped}</code></pre>
      </details>
    </div>`;
  }

  glob("docs/*", (err, files) => {
    if (!err) {
      files.forEach((srcFile) =>
        fs.copyFileSync(srcFile, path.join("dist", path.basename(srcFile)))
      );
    } else throw "error globbing dist directory.";
  });
  fs.writeFileSync(
    path.join(__dirname, "/dist/index.html"),
    ejs.render(template, { getNewId, getCurrentId, example })
  );
}

function build() {
  buildCSS()
    .then(buildDocs)
    .catch((err) => console.log(err));
}
module.exports = build;

build();
