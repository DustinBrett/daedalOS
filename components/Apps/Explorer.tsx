import ExplorerIcon from '@/assets/icons/Explorer.png';

import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { DateTimeFormatParts } from '@/utils';

import { FC, useContext, useEffect, useState } from 'react';
import App from '@/contexts/App';
import { FilesContext, FilesProvider } from '@/contexts/Files';
import { datePartsToObject, newDateTimeFormat } from '@/utils';
import { resolve } from 'path';

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

const toDateModified = {
  dateStyle: 'medium',
  timeStyle: 'short',
  hour12: true
};

const formatToDateTime = (date: Date) => {
  const { month, day, year, hour, minute, dayPeriod } = newDateTimeFormat(
    toDateModified
  )
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod}`;
};

const fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

const formatByteSize = (size: number) => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(1024));

  return (
    Math.round(size / Math.pow(1024, sizeFactor)) + ' ' + fileSizes[sizeFactor]
  );
};

const DirectoryListing: FC = () => {
  const fs = useContext(FilesContext),
    [directoryContents, setDirectoryContents] = useState<
      Array<FsDirectoryEntry>
    >([]),
    [dir, cd] = useState('/');

  useEffect(() => {
    fs?.readdir?.(dir, async (_error, contents = []) => {
      const contentsWithStats = await Promise.all(
        contents.map(async (file) => {
          const path = `${dir}${dir === '/' ? '' : '/'}${file}`,
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

  return (
    <table>
      <thead>
        <tr>
          <td>Name</td>
          <td>Date Modified</td>
          <td>Size</td>
          <td>Kind</td>
        </tr>
      </thead>
      <tbody>
        {dir !== '/' && (
          <tr>
            <td>
              <a href="#" onClick={() => cd(resolve(dir, '..'))}>
                ..
              </a>
            </td>
          </tr>
        )}
        {directoryContents.map(({ name, path, size, mtime, isDirectory }) => (
          <tr key={path}>
            <td>
              {isDirectory ? (
                <a href="#" onClick={() => cd(path)}>
                  {name}
                </a>
              ) : (
                name
              )}
            </td>
            <td>{mtime && formatToDateTime(mtime)}</td>
            <td>{isDirectory ? '--' : formatByteSize(size)}</td>
            <td>{isDirectory ? 'Directory' : 'File'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Explorer: FC = () => (
  <article>
    <FilesProvider>
      <DirectoryListing />
    </FilesProvider>
  </article>
);

export default new App({
  component: Explorer,
  icon: ExplorerIcon,
  name: 'Explorer'
});
