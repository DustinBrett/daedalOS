import type { FC } from 'react';
import type { DirectoryEntry } from '@/components/System/Directory/Directory.d';

import { basename, extname, resolve } from 'path';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { getDirectory } from '@/utils/directory';
import { FileContext } from '@/contexts/FileSystem';
import { ProcessContext } from '@/contexts/ProcessManager';
import { View } from '@/components/System/Directory/Directory.d';
import DirectoryIcons from '@/components/System/Directory/DirectoryIcons';

const DirectoryList = dynamic(
  import('@/components/System/Directory/DirectoryList')
);

export const Directory: FC<{
  path: string;
  view?: View;
}> = ({ path, view = View.Icons }) => {
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
    getDirectory(fs, cwd, view === View.List, setEntries);
    // TODO: Explorer should do this, not Directory
    title?.('explorer', cwd === '/' ? 'home' : basename(cwd));
  }, [fs, cwd]);

  switch (view) {
    case View.Icons:
      return <DirectoryIcons entries={entries} onDoubleClick={onDoubleClick} />;
    case View.List:
      return (
        <DirectoryList
          entries={entries}
          onDoubleClick={onDoubleClick}
          cwd={cwd}
        />
      );
    default:
      return <p>Unknown View Type</p>;
  }
};

export default Directory;
