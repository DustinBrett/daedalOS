import type { LocalEcho } from "components/apps/Terminal/types";
import { basename, dirname, extname, join } from "path";
import { loadFiles } from "utils/functions";
import type { ImageMagickConvertFile } from "utils/imagemagick/types";

export const convert = async (
  files: ImageMagickConvertFile[],
  extension: string,
  localEcho?: LocalEcho
): Promise<ImageMagickConvertFile[]> => {
  const returnFiles: ImageMagickConvertFile[] = [];

  await loadFiles([
    "/Program Files/imagemagick/wasm-imagemagick.umd-es5.min.js",
  ]);

  const { call } = window["wasm-imagemagick"];

  await Promise.all(
    files.map(async ([fileName, fileData]) => {
      const baseName = basename(fileName);
      const newName = `${basename(fileName, extname(fileName))}.${extension}`;
      const {
        exitCode,
        outputFiles: [image] = [],
        stderr,
        stdout,
      } = await call(
        [{ content: fileData, name: baseName }],
        ["convert", baseName, newName]
      );
      const output = (exitCode !== 0 ? stdout : stderr).join("\n");

      if (output) localEcho?.println(output);

      returnFiles.push([join(dirname(fileName), newName), image?.buffer]);
    })
  );

  return returnFiles;
};
