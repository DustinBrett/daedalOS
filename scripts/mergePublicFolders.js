let fs = require("fs");
let fse = require("fs-extra");

const args = process.argv.slice(2);
const minimal = args[args.length - 1] == "minimal";

let sourceDirs = minimal
  ? ["./publicMinimal", "./publicCustom"]
  : ["./publicMinimal", "./publicDefault", "./publicCustom"];
let destDir = "./public";

// If destination folder doesn't exist, create it
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
if (!fs.existsSync("./publicCustom")) {
  fs.mkdirSync("./publicCustom", { recursive: true });
}
console.log(
  "Cleaning ./public (deleting everything INCLUDING ./public/.index/*)..."
);
fse.emptyDirSync(destDir);

const IGNORE_PATHS = [];

if (fse.existsSync("./.publicfilter")) {
  const excludedPathsRaw = fs
    .readFileSync("./.publicfilter")
    .toString()
    .split("\n");

  for (i in excludedPathsRaw) {
    !excludedPathsRaw[i].startsWith("#") && excludedPathsRaw[i] != ""
      ? IGNORE_PATHS.push(excludedPathsRaw[i].trim())
      : null;
  }
} else {
  console.log(
    "No .publicfilter file found! No paths will be ignored when merging."
  );
}
console.log("Ignored paths:", JSON.stringify(IGNORE_PATHS));

const filterFunc = (baseSrc, baseDst) => (src, dst) => {
  // The publicCustom folder should NOT be filtered, whatever is in there is to be used.
  if (baseSrc == "./publicCustom") return true;
  const stripFirstFolder = /([^\/]+)\/(.+)/gi;
  const m = stripFirstFolder.exec(src);
  if (
    m !== null &&
    IGNORE_PATHS.some((ignoredPath) => m[2].startsWith(ignoredPath))
  ) {
    console.log(`Skipping file: ${m[2]}`);
    return false;
  } else {
    return true;
  }
};

sourceDirs.forEach((sourceDir) => {
  console.log(`Copying ${sourceDir} to ./public`);
  if (fse.existsSync(sourceDir)) {
    fse.copySync(sourceDir, destDir, {
      filter: filterFunc(sourceDir, destDir),
    });
  } else {
    console.log(`"${sourceDir}" doesn't exist! Aborting...`);
    process.exit(1);
  }
  console.log(`Completed copying ${sourceDir}!`);
});
