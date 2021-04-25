import type { FSModule } from 'browserfs/dist/node/core/FS';
import JSZip from 'jszip';

export const addFileToZip = (
  buffer: Buffer,
  filePath: string,
  zipFilePath: string,
  fs: FSModule
): Promise<Buffer> =>
  new Promise((resolve) =>
    new JSZip().loadAsync(buffer).then((zipFile) =>
      fs.readFile(filePath, (_error, contents = Buffer.from('')) =>
        zipFile
          .file(zipFilePath, contents)
          .generateAsync({ type: 'nodebuffer' })
          .then((newZipFile) => resolve(newZipFile))
      )
    )
  );

export const isFileInZip = (
  buffer: Buffer,
  zipFilePath: string
): Promise<boolean> =>
  new Promise((resolve) =>
    new JSZip()
      .loadAsync(buffer)
      .then((zipFile) =>
        resolve(Object.keys(zipFile.files).includes(zipFilePath))
      )
  );
