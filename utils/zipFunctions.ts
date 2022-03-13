import type {
  AsyncZipOptions,
  AsyncZippable,
  AsyncZippableFile,
  Unzipped,
} from "fflate";
import { BASE_ZIP_CONFIG } from "utils/constants";

const unRarLib = "/System/Unrar.js/unrar.wasm";

export const createZippable = (path: string, file: Buffer): AsyncZippable =>
  path
    .split("/")
    .reduceRight<AsyncZippable>((value, key) => ({ [key]: value }), [
      file,
      BASE_ZIP_CONFIG,
    ] as AsyncZippableFile as AsyncZippable);

export const addEntryToZippable = (
  oldZippable: AsyncZippable,
  newZippable: AsyncZippable
): AsyncZippable => {
  const [[key, value]] = Object.entries(newZippable);

  if (!(key in oldZippable)) {
    return { ...oldZippable, [key]: value };
  }

  return {
    ...oldZippable,
    [key]: addEntryToZippable(
      oldZippable[key] as AsyncZippable,
      newZippable[key] as AsyncZippable
    ),
  };
};

export const unzipAsync = (zipFile: Buffer): Promise<Unzipped> =>
  new Promise((resolve, reject) => {
    import("fflate").then(({ unzip }) =>
      unzip(zipFile, (error, data) => (error ? reject(error) : resolve(data)))
    );
  });

export const zipAsync = (
  data: AsyncZippable,
  opts: AsyncZipOptions = BASE_ZIP_CONFIG
): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    import("fflate").then(({ zip }) =>
      zip(data, opts, (error, zipData) =>
        error ? reject(error) : resolve(zipData)
      )
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
      addEntryToZippable(
        (buffer.length > 0 && (await unzipAsync(buffer))) || {},
        createZippable(zipFilePath, await readFile(filePath))
      )
    )
  );

export const isFileInZip = (
  buffer: Buffer,
  zipFilePath: string
): Promise<boolean> =>
  new Promise((resolve, reject) => {
    import("fflate").then(({ unzip }) =>
      unzip(buffer, (unzipError, zipData) =>
        unzipError
          ? reject(unzipError)
          : resolve(Object.keys(zipData).includes(zipFilePath))
      )
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
