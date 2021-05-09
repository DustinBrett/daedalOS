import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { AsyncZippable } from 'fflate';
import { unzip, zip } from 'fflate';

const addFileToZippable = (path: string, file: Buffer): AsyncZippable => {
  const zippableData: AsyncZippable = {};

  path.split('/').reduce((walkedPath, pathPart, index, { length }) => {
    const endOfPath = index === length - 1;
    const currentPath = `${walkedPath}${pathPart}${endOfPath ? '' : '/'}`;

    zippableData[currentPath] = endOfPath
      ? [file, { level: 0 }]
      : new Uint8Array();

    return currentPath;
  }, '');

  return zippableData;
};

export const addFileToZip = (
  buffer: Buffer,
  filePath: string,
  zipFilePath: string,
  fs: FSModule
): Promise<Buffer> =>
  new Promise((resolve) =>
    unzip(buffer, (_unzipError, zipData) =>
      fs.readFile(filePath, (_readError, contents = Buffer.from('')) =>
        zip(
          {
            ...zipData,
            ...addFileToZippable(zipFilePath, contents)
          },
          (_zipError, newZipFile) => resolve(newZipFile as Buffer)
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
