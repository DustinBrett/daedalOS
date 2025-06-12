import { basename, dirname, extname, join } from "path";
import { blobToBuffer, loadFiles } from "utils/functions";
import { type ImageMagickConvertFile } from "utils/imagemagick/types";

export const convert = async (
  files: ImageMagickConvertFile[],
  extension: string,
  printLn?: (message: string) => void
): Promise<ImageMagickConvertFile[]> => {
  const returnFiles: ImageMagickConvertFile[] = [];

  await loadFiles(
    ["/System/imagemagick/wasm-imagemagick.umd-es5.min.js"],
    false,
    true
  );

  const { call } = window["wasm-imagemagick"] || {};

  if (call) {
    await Promise.all(
      files.map(async ([fileName, fileData]) => {
        const baseName = basename(fileName);
        const newName = `${basename(fileName, extname(fileName))}.${extension}`;
        const {
          outputFiles: [image] = [],
          stderr,
          stdout,
        } = await call(
          [{ content: fileData, name: baseName }],
          ["convert", baseName, "-verbose", newName]
        );
        const output = [...stdout, ...stderr].join("\n");

        if (output) printLn?.(output);

        returnFiles.push([
          join(dirname(fileName), newName),
          await blobToBuffer(image?.blob),
        ]);
      })
    );
  }

  return returnFiles;
};
