import { basename, extname, join } from "path";
import {
  type AsyncZipOptions,
  type AsyncZippable,
  type AsyncZippableFile,
  type Unzipped,
} from "fflate";
import type SevenZip from "7z-wasm";
import { loadFiles } from "utils/functions";
import { BASE_ZIP_CONFIG } from "utils/constants";

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

  // eslint-disable-next-line no-param-reassign
  oldZippable[key] =
    key in oldZippable
      ? addEntryToZippable(
          oldZippable[key] as AsyncZippable,
          newZippable[key] as AsyncZippable
        )
      : value;

  return oldZippable;
};

const unzipAsync = (zipFile: Buffer): Promise<Unzipped> =>
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

declare global {
  interface Window {
    SevenZip: typeof SevenZip;
  }
}

export const unarchive = async (
  path: string,
  data: Buffer
): Promise<Unzipped> => {
  if (!window.SevenZip) {
    await loadFiles(["System/7zip/7zz.umd.js"]);
  }

  if (!window.SevenZip) return {};

  const sevenZip = await window.SevenZip();
  const fileName = basename(path);
  const extractFolder = join("/", basename(path, extname(path)));

  sevenZip.FS.mkdir(extractFolder);
  sevenZip.FS.chdir(extractFolder);

  const stream = sevenZip.FS.open(fileName, "w+");

  sevenZip.FS.write(stream, data, 0, data.length);
  sevenZip.FS.close(stream);
  sevenZip.callMain(["-y", "x", fileName]);

  const extractedFiles = sevenZip.FS.readdir(extractFolder);
  const reduceFiles =
    (currentPath: string) =>
    (accFiles: Unzipped, file: string): Unzipped => {
      if ([".", "..", fileName].includes(file)) return accFiles;

      const filePath = join(currentPath, file);
      const extractPath = filePath.replace(extractFolder, "");

      try {
        sevenZip.FS.chmod(filePath, 0o777);
      } catch {
        // Ignore failure to change permissions
      }

      Object.assign(
        accFiles,
        sevenZip.FS.isDir(sevenZip.FS.stat(filePath).mode)
          ? {
              [join(extractPath, "/")]: Buffer.from(""),
              ...sevenZip.FS.readdir(filePath).reduce(
                reduceFiles(filePath),
                {}
              ),
            }
          : {
              [extractPath]: sevenZip.FS.readFile(filePath, { flags: "r" }),
            }
      );

      return accFiles;
    };

  return extractedFiles.reduce(reduceFiles(extractFolder), {});
};
