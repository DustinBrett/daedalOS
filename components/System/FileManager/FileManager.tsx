import type {
  DirectoryEntry,
  DirectoryEntryDoubleClick,
  DirectoryType
} from '@/types/components/System/FileManager/FileManager';

import { extname, resolve } from 'path';
import { FileContext } from '@/contexts/FileSystem';
import { getAppNameByExtension } from '@/utils/programs';
import { getDirectory, getDirectoryEntry } from '@/utils/filemanager';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useEffect, useState } from 'react';
import { useFileDrop } from '@/utils/events';

const FileManager: React.FC<DirectoryType> = ({
  path: directoryPath,
  render,
  details = false,
  onChange
}) => {
  const [cwd, cd] = useState(directoryPath);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const fs = useContext(FileContext);
  const { load, open } = useContext(ProcessContext);
  const { foreground, getState } = useContext(SessionContext);
  const fileDropHandler = useFileDrop(async (dragEvent, file) => {
    const processsId = await load(
      file,
      getState({ name: file.name }),
      dragEvent.target
    );
    foreground(processsId);
    fs.writeFile(`${cwd}/${file.name}`, file);
    setEntries([
      ...entries,
      await getDirectoryEntry(fs, cwd, file.name, details)
    ]);
  });
  const onDoubleClick = ({
    path,
    url,
    icon = '',
    name = ''
  }: DirectoryEntryDoubleClick) => (event: React.MouseEvent<Element>) => {
    if (path && !path.includes('.url') && (path === '..' || !extname(path))) {
      cd(path === '..' ? resolve(cwd, '..') : path);
    } else {
      const appUrl = url || path || '';
      const processsId = open(
        {
          url: appUrl,
          icon,
          name,
          ...(appUrl ? { appName: getAppNameByExtension(extname(appUrl)) } : {})
        },
        getState({ name }),
        event.currentTarget
      );
      if (processsId) {
        foreground(processsId);
        onChange?.();
      }
    }
  };

  useEffect(() => {
    getDirectory(fs, cwd, details, setEntries);
    onChange?.(cwd);
  }, [fs, cwd]);

  return (
    <div {...fileDropHandler}>{render({ entries, onDoubleClick, cwd })}</div>
  );
};

export default FileManager;
