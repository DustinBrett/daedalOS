import type { FC } from 'react';
import type {
  DirectoryEntry,
  DirectoryType,
  DirectoryEntryDoubleClick
} from '@/types/components/System/FileManager/FileManager';

import { extname, resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/filemanager';
import { getTargetCenterPosition } from '@/utils/elements';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

export const FileManager: FC<DirectoryType> = ({
  path: directoryPath,
  render,
  details = false,
  onChange
}) => {
  const [cwd, cd] = useState(directoryPath);
  const [entries, setEntries] = useState<Array<DirectoryEntry>>([]);
  const fs = useContext(FileContext);
  const { open, restore } = useContext(ProcessContext);
  const { foreground, getState } = useContext(SessionContext);
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
      foreground(processsId);
      restore(processsId);
    }
  };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    onChange?.(cwd);
  }, [fs, cwd]);

  return render({ entries, onDoubleClick, cwd });
};

export default FileManager;
