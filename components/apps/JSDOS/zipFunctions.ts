import type { FSModule } from "browserfs/dist/node/core/FS";
import type { AsyncZippable } from "fflate";
import { unzip, zip } from "fflate";
import { join } from "path";
import { EMPTY_BUFFER } from "utils/constants";

const addFileToZippable = (path: string, file: Buffer): AsyncZippable =>
  path.split("/").reduce((zippableData, pathPart, index, { length }) => {
    const endOfPath = index === length - 1;
    const walkedPath = Object.keys(zippableData)[index - 1] || "";
    const currentPath = join(walkedPath, pathPart, endOfPath ? "" : "/");

    return {
      ...zippableData,
      [currentPath]: endOfPath ? [file, { level: 0 }] : new Uint8Array(),
    };
  }, {} as AsyncZippable);

export const addFileToZip = (
  buffer: Buffer,
  filePath: string,
  zipFilePath: string,
  fs: FSModule
): Promise<Buffer> =>
  new Promise((resolve) =>
    unzip(buffer, (_unzipError, zipData) =>
      fs.readFile(filePath, (_readError, contents = EMPTY_BUFFER) =>
        zip(
          {
            ...zipData,
            ...addFileToZippable(zipFilePath, contents),
          },
          (_zipError, newZipFile) => resolve(Buffer.from(newZipFile))
        )
      )
    )
  );

export const isFileInZip = (
  buffer: Buffer,
  zipFilePath: string
): Promise<boolean> =>
  new Promise((resolve) =>
    unzip(buffer, (_unzipError, zipData) =>
      resolve(Object.keys(zipData).includes(zipFilePath))
    )
  );
