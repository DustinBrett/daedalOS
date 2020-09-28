import type {
  DirectoryEntry,
  DirectoryType,
  DirectoryEntryDoubleClick
} from '@/types/components/System/FileManager/FileManager';

import { extname, resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/filemanager';
import { getTargetCenterPosition } from '@/utils/elements';
import { useFileDrop } from '@/utils/events';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

export const FileManager: React.FC<DirectoryType> = ({
  path: directoryPath,
  render,
  details = false,
  onChange
}) => {
  const [cwd, cd] = useState(directoryPath);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const fs = useContext(FileContext);
  const { load, open, restore } = useContext(ProcessContext);
  const { foreground, getState } = useContext(SessionContext);
  const fileDropHandler = useFileDrop(({ pageX, pageY }, file) => {
    load(file, getState({ name: file.name }), { startX: pageX, startY: pageY });
  });
  const onDoubleClick = (
    event: React.MouseEvent<Element>,
    { path, url, icon = '', name = '' }: DirectoryEntryDoubleClick
  ) => {
    if (path && !path.includes('.url') && (path === '..' || !extname(path))) {
      cd(path === '..' ? resolve(cwd, '..') : path);
    } else {
      const { x: startX, y: startY } = getTargetCenterPosition(
        event.currentTarget
      );
      const processsId = open(
        { url: url || path || '', icon, name },
        getState({ name }),
        {
          startX,
          startY
        }
      );
      restore(processsId);
      foreground(processsId);
    }
  };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    onChange?.(cwd);
  }, [fs, cwd]);

  return (
    <div {...fileDropHandler}>
      { render({ entries, onDoubleClick, cwd }) }
    </div>
  );
};

export default FileManager;
