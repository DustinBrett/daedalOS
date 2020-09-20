import type { FC } from 'react';
import type {
  DirectoryEntry,
  DirectoryType,
  DirectoryEntryDoubleClick
} from '@/components/System/Directory/Directory.d';

import { extname, resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/directory';
import { getTargetCenterPosition } from '@/utils/elements';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

export const Directory: FC<DirectoryType> = ({
  path,
  render,
  details = false,
  onChange
}) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FileContext),
    { open } = useContext(ProcessContext),
    { foreground, getState } = useContext(SessionContext),
    onDoubleClick = (
      event: React.MouseEvent<Element>,
      { path, url, icon = '', name = '' }: DirectoryEntryDoubleClick
    ) => {
      if (path && !path.includes('.url') && (path === '..' || !extname(path))) {
        cd(path === '..' ? resolve(cwd, '..') : path);
      } else {
        const { x: startX, y: startY } = getTargetCenterPosition(
          event.currentTarget
        );
        foreground(
          open({ url: url || path || '', icon, name }, getState({ name }), {
            startX,
            startY
          })
        );
      }
    };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    onChange?.(cwd);
  }, [fs, cwd]);

  return render({ entries, onDoubleClick, cwd });
};

export default Directory;
