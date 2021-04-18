import { useFileSystem } from 'contexts/fileSystem';
import { useCallback } from 'react';

const haltDragEvent = (event: React.DragEvent<HTMLElement>): void => {
  event.preventDefault();
  event.stopPropagation();
};

type FileDrop = {
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
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
      const reader = new FileReader();

      reader.onload = ({ target }) => {
        fs?.writeFile(
          `${directory}/${file.name}`,
          Buffer.from(new Uint8Array(target?.result as ArrayBuffer)),
          (error) => !error && updateFiles(file.name)
        );
      };

      reader.readAsArrayBuffer(file);
    },
    [directory, fs, updateFiles]
  );

  return {
    onDragOver: haltDragEvent,
    onDrop
  };
};

export default useFileDrop;
