import type {
  AsyncZipOptions,
  AsyncZippable,
  AsyncZippableFile,
  Unzipped,
} from "fflate";
import { join } from "path";
import { BASE_ZIP_CONFIG } from "utils/constants";
import { bufferToBlob } from "utils/functions";

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
  oldZippable[key] = !(key in oldZippable)
    ? value
    : addEntryToZippable(
        oldZippable[key] as AsyncZippable,
        newZippable[key] as AsyncZippable
      );

  return oldZippable;
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

type FilesObject = { [key: string]: File | FilesObject };

export const unarchive = async (data: Buffer): Promise<Unzipped> => {
  const { Archive } = await import("libarchive.js");

  Archive.init({ workerUrl: "/System/libarchive.js/worker-bundle.js" });

  const archive = await Archive.open(new File([bufferToBlob(data)], "archive"));
  const extractedFiles = await archive.extractFiles();
  const returnFiles: Unzipped = {};
  const parseFiles = async (
    files: FilesObject,
    walkedPath = ""
  ): Promise<void> => {
    await Promise.all(
      Object.entries(files).map(async ([name, file]) => {
        const extractPath = join(walkedPath, name);

        if (file instanceof File) {
          returnFiles[extractPath] = new Uint8Array(await file.arrayBuffer());
        } else {
          returnFiles[join(extractPath, "/")] = new Uint8Array(Buffer.from(""));
          await parseFiles(file, extractPath);
        }
      })
    );
  };

  await parseFiles(extractedFiles as FilesObject);

  return returnFiles;
};
