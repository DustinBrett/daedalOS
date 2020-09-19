import type { FC } from 'react';
import type {
  DirectoryEntry,
  DirectoryView
} from '@/components/System/Directory/Directory.d';

import { extname, resolve } from 'path';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/directory';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

export const Directory: FC<{
  path: string;
  render: FC<DirectoryView>;
  details?: boolean;
  onChange?: (cwd: string) => void;
}> = ({ path, render, details = false, onChange }) => {
  const [cwd, cd] = useState(path),
    [entries, setEntries] = useState<Array<DirectoryEntry>>([]),
    fs = useContext(FileContext),
    { open } = useContext(ProcessContext),
    { getState } = useContext(SessionContext),
    onDoubleClick = (
      path?: string,
      url?: string,
      icon = '',
      name = ''
    ) => () => {
      if (path && !path.includes('.url') && (path === '..' || !extname(path))) {
        cd(path === '..' ? resolve(cwd, '..') : path);
      } else {
        open?.({ url: url || path || '', icon, name }, getState(name));
      }
    };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    onChange?.(cwd);
  }, [fs, cwd]);

  return render({ entries, onDoubleClick, cwd });
};

export default Directory;
