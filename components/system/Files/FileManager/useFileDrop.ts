import { useFileSystem } from 'contexts/fileSystem';
import { basename, dirname, extname } from 'path';
import { useCallback } from 'react';

const haltDragEvent = (event: React.DragEvent<HTMLElement>): void => {
  event.preventDefault();
  event.stopPropagation();
};

type FileDrop = {
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
};

const iterateFileName = (path: string, iteration: number): string => {
  const extension = extname(path);
  const fileName = basename(path, extension);

  return `${dirname(path)}/${fileName} (${iteration})${extension}`;
};

const useFileDrop = (
  directory: string,
  updateFiles: (appendFile?: string) => void
): FileDrop => {
  const { fs } = useFileSystem();
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      haltDragEvent(event);

      const { files: [file] = [] } = event.dataTransfer || {};

      if (file) {
        const writeUniqueName = (
          path: string,
          fileBuffer: Buffer,
          iteration = 0
        ): void => {
          const writePath = !iteration
            ? path
            : iterateFileName(path, iteration);

          fs?.stat(writePath, (statError) => {
            if (statError?.code === 'ENOENT') {
              fs?.writeFile(
                writePath,
                fileBuffer,
                (writeError) => !writeError && updateFiles(writePath)
              );
            } else {
              writeUniqueName(path, fileBuffer, iteration + 1);
            }
          });
        };
        const reader = new FileReader();

        reader.onload = ({ target }) => {
          writeUniqueName(
            `${directory}/${file.name}`,
            Buffer.from(new Uint8Array(target?.result as ArrayBuffer))
          );
        };

        reader.readAsArrayBuffer(file);
      }
    },
    [directory, fs, updateFiles]
  );

  return {
    onDragOver: haltDragEvent,
    onDrop
  };
};

export default useFileDrop;
