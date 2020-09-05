import styles from '@/styles/Apps/Explorer.module.scss';
import ExplorerIcon from '@/assets/icons/Explorer.png';
import UnknownFileIcon from '@/assets/icons/Unknown.png';

import { FC, useContext, useEffect, useState } from 'react';
import App from '@/contexts/App';
import { FilesContext, FilesProvider, getFileStat } from '@/contexts/Files';
import { formatToLongDateTime } from '@/utils/dateTime';
import { resolve } from 'path';

const homeDir = '/';

type FsDirectoryEntry = {
  name: string;
  path: string;
  mtime: Date;
  formattedModifiedTime: string;
  size: number;
  formattedSize: string;
  isDirectory: boolean;
  kind: string;
  icon: string;
};

const bytesInKB = 1024;

const fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

const formatByteSize = (size: number) => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB)),
    newSize = Math.round(size / Math.pow(bytesInKB, sizeFactor));

  return `${newSize} ${fileSizes[sizeFactor]}`;
};

const getFileKind = (name: string): string => {
  const ext = name?.split('.')?.pop() || '';

  switch (ext?.toLowerCase()) {
    case 'txt':
      return 'Plain Text';
    case 'json':
      return 'JSON Document';
    case 'ico':
      return 'Icon Image';
    case 'woff2':
      return 'Web Font';
    case 'zip':
      return 'ZIP Archive';
    case 'mp3':
      return 'MP3 Audio';
    case 'js':
      return 'JavaScript Document';
    case 'wsz':
      return 'Winamp Skin';
  }

  return '';
};

const getFileIcon = (name: string) => {
  const ext = name?.split('.')?.pop() || '';

  switch (ext?.toLowerCase()) {
    default:
      return UnknownFileIcon;
  }
};

const openFile = (path: string) => {
  // TODO: updateApps (find app in directory and set as running?)
  // TODO: Or find app and set it's "args" before running
  // TODO: Find which app based on the file extension
  console.log('OPEN FILE: ' + path);
};

const previousDir = (dir: string, cd: (dir: string) => void) => (
  <tr onDoubleClick={() => cd(resolve(dir, '..'))}>
    <td>..</td>
    <td colSpan={3}></td>
  </tr>
);

const DirectoryListing: FC = () => {
  const fs = useContext(FilesContext),
    [directoryContents, setDirectoryContents] = useState<
      Array<FsDirectoryEntry>
    >([]),
    [dir, cd] = useState(homeDir),
    [selected, setSelected] = useState('');

  // TODO: Export this out
  useEffect(() => {
    fs?.readdir?.(dir, async (_error, contents = []) => {
      const contentsWithStats = await Promise.all(
        contents.map(async (file) => {
          const path = `${dir}${dir === homeDir ? '' : '/'}${file}`,
            stats = await getFileStat(fs, path),
            { mtime, size } = stats || {},
            isDirectory = stats?.isDirectory() || false;

          return {
            name: file,
            path,
            icon: isDirectory ? ExplorerIcon : getFileIcon(name),
            mtime,
            formattedModifiedTime: mtime && formatToLongDateTime(mtime),
            size,
            formattedSize: isDirectory ? '--' : formatByteSize(size),
            isDirectory,
            kind: isDirectory ? 'Folder' : getFileKind(name)
          };
        })
      );

      setDirectoryContents(contentsWithStats);
    });
  }, [fs, dir]);

  // TODO: DoubleTap
  return (
    <table className={styles.directory}>
      <thead>
        <tr className={styles.emphasis}>
          <td>Name</td>
          <td>Date Modified</td>
          <td>Size</td>
          <td>Kind</td>
        </tr>
      </thead>
      <tbody>
        {dir !== homeDir && previousDir(dir, cd)}
        {directoryContents.map(
          ({
            path,
            isDirectory,
            name,
            icon,
            formattedModifiedTime,
            formattedSize,
            kind
          }) => (
            <tr
              key={path}
              className={selected === path ? styles.selected : ''}
              onClick={() => setSelected(path)}
              onDoubleClick={() => (isDirectory ? cd(path) : openFile(path))}
            >
              <td className={styles.emphasis}>
                <img alt={name} src={icon} draggable={false} />
                {name}
              </td>
              <td>{formattedModifiedTime}</td>
              <td>{formattedSize}</td>
              <td>{kind}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

const Explorer: FC = () => (
  <article className={styles.explorer}>
    <FilesProvider>
      <DirectoryListing />
    </FilesProvider>
  </article>
);

export default new App({
  component: Explorer,
  icon: ExplorerIcon,
  name: 'Explorer',
  width: 450,
  height: 225
});
