import type { AsyncZipOptions, AsyncZippable, Unzipped } from "fflate";
import { unzip, zip } from "fflate";
import { join } from "path";
import { EMPTY_BUFFER } from "utils/constants";

const unRarLib = "/System/Unrar.js/unrar.wasm";

const addFileToZippable = (path: string, file: Buffer): AsyncZippable =>
  path
    .split("/")
    .reduce<AsyncZippable>((zippableData, pathPart, index, { length }) => {
      const endOfPath = index === length - 1;
      const walkedPath = Object.keys(zippableData)[index - 1] || "";
      const currentPath = join(walkedPath, pathPart, endOfPath ? "" : "/");

      return {
        ...zippableData,
        [currentPath]: endOfPath ? [file, { level: 0 }] : new Uint8Array(),
      };
    }, {});

export const unzipAsync = (zipFile: Buffer): Promise<Unzipped> =>
  new Promise((resolve, reject) => {
    unzip(zipFile, (error, data) => (error ? reject(error) : resolve(data)));
  });

export const zipAsync = (
  data: AsyncZippable,
  opts: AsyncZipOptions = {}
): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    zip(data, opts, (error, zipData) =>
      error ? reject(error) : resolve(zipData)
    );
  });

export const addFileToZip = async (
  buffer: Buffer,
  filePath: string,
  zipFilePath: string,
  readFile: (path: string) => Promise<Buffer>
): Promise<Buffer> =>
  Buffer.from(
    await zipAsync(
      {
        ...(buffer !== EMPTY_BUFFER && (await unzipAsync(buffer))),
        ...addFileToZippable(zipFilePath, await readFile(filePath)),
      },
      { level: 0 }
    )
  );

export const isFileInZip = (
  buffer: Buffer,
  zipFilePath: string
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    unzip(buffer, (unzipError, zipData) =>
      unzipError
        ? reject(unzipError)
        : resolve(Object.keys(zipData).includes(zipFilePath))
    );
  });

export { unzipAsync as unzip };

export const unrar = async (data: Buffer): Promise<Unzipped> => {
  const wasmModule = await fetch(unRarLib);
  const wasmBinary = await wasmModule.arrayBuffer();
  const { createExtractorFromData } = await import("node-unrar-js");
  const extractor = await createExtractorFromData({ data, wasmBinary });
  const { files: rarFiles } = extractor.extract({
    files: ({ flags }) => !flags.encrypted,
  });
  const extractedFiles: Record<string, Uint8Array> = {};

  for (const { extraction, fileHeader } of rarFiles) {
    extractedFiles[fileHeader.name] = extraction;
  }

  return extractedFiles;
};
