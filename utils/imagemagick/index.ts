import type { LocalEcho } from "components/apps/Terminal/types";
import { basename, dirname, extname, join } from "path";
import { EMPTY_BUFFER } from "utils/constants";
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
        outputFiles: [image] = [],
        stderr,
        stdout,
      } = await call(
        [{ content: fileData, name: baseName }],
        ["convert", baseName, "-verbose", newName]
      );
      const output = [...stdout, ...stderr].join("\n");

      if (output) localEcho?.println(output);

      returnFiles.push([
        join(dirname(fileName), newName),
        image.blob ? Buffer.from(await image.blob.arrayBuffer()) : EMPTY_BUFFER,
      ]);
    })
  );

  return returnFiles;
};
