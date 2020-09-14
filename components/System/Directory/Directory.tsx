import type { FC } from 'react';
import type {
  DirectoryEntry,
  DirectoryView
} from '@/components/System/Directory/Directory.d';

import { basename, extname, resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/directory';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';

export const Directory: FC<{
  path: string;
  render: FC<DirectoryView>;
  details?: boolean;
}> = ({ path, render, details = false }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FileContext),
    { open, title } = useContext(ProcessContext),
    onDoubleClick = (
      path?: string,
      url?: string,
      icon = '',
      name = ''
    ) => () => {
      if (path && !path.includes('.url') && (path === '..' || !extname(path))) {
        cd(path === '..' ? resolve(cwd, '..') : path);
      } else {
        open?.(url || path || '', icon, name);
      }
    };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    // TODO: Explorer should do this, not Directory
    title?.('explorer', cwd === '/' ? 'home' : basename(cwd));
  }, [fs, cwd]);

  return render({ entries, onDoubleClick, cwd });
};

export default Directory;
