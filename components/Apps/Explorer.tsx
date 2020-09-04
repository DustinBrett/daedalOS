import styles from '@/styles/Apps/Explorer.module.scss';
import ExplorerIcon from '@/assets/icons/Explorer.png';
import UnknownFileIcon from '@/assets/icons/Unknown.png';

import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { DateTimeFormatParts } from '@/utils';

import { FC, useContext, useEffect, useState } from 'react';
import App from '@/contexts/App';
import { FilesContext, FilesProvider } from '@/contexts/Files';
import { datePartsToObject, newDateTimeFormat } from '@/utils';
import { resolve } from 'path';

const homeDir = '/';

type StatsProto = {
  isDirectory: () => boolean;
  isFile: () => boolean;
};

type FsDirectoryEntry = {
  name: string;
  path: string;
  mtime: Date;
  size: number;
  isDirectory: boolean;
};

const bytesInKB = 1024;

const toDateModified: Partial<Intl.DateTimeFormatOptions> = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};

const fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

const formatToDateTime = (date: Date) => {
  const { month, day, year, hour, minute, dayPeriod } = newDateTimeFormat(
    toDateModified
  )
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod}`;
};

const formatByteSize = (size: number) => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB)),
    newSize = Math.round(size / Math.pow(bytesInKB, sizeFactor));

  return `${newSize} ${fileSizes[sizeFactor]}`;
};

const getFileKind = (name: string) => {
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
};

const getFileIcon = (name: string) => {
  const ext = name?.split('.')?.pop() || '';

  switch (ext?.toLowerCase()) {
    default:
      return UnknownFileIcon;
  }
};

const openFile = (path: string) => {
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

  useEffect(() => {
    fs?.readdir?.(dir, async (_error, contents = []) => {
      const contentsWithStats = await Promise.all(
        contents.map(async (file) => {
          const path = `${dir}${dir === homeDir ? '' : '/'}${file}`,
            stats = (await new Promise((resolve) =>
              fs?.stat?.(path, (_error, stats) => resolve(stats))
            )) as Stats & StatsProto,
            { mtime, size } = stats || {},
            isDirectory = stats?.isDirectory() || false;

          return { name: file, path, mtime, size, isDirectory };
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
        {directoryContents.map(({ path, isDirectory, name, mtime, size }) => (
          <tr
            key={path}
            className={selected === path ? styles.selected : ''}
            onClick={() => setSelected(path)}
            onDoubleClick={() => (isDirectory ? cd(path) : openFile(path))}
          >
            <td className={styles.emphasis}>
              <img
                alt={name}
                src={isDirectory ? ExplorerIcon : getFileIcon(name)}
                draggable={false}
              />
              {name}
            </td>
            <td>{mtime && formatToDateTime(mtime)}</td>
            <td>{isDirectory ? '--' : formatByteSize(size)}</td>
            <td>{isDirectory ? 'Folder' : getFileKind(name)}</td>
          </tr>
        ))}
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
