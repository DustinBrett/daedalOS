import type { DirectoryEntry } from '@/types/components/System/FileManager/FileManager';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { Shortcut } from '@/types/utils/shortcut';

import { extname } from 'path';
import { FileStat } from '@/types/utils/filesystem';
import {
  getFileIcon,
  getFileKind,
  getFileStat,
  getFormattedSize
} from '@/utils/file';
import { parseShortcut } from '@/utils/shortcut';
import { ROOT_DIRECTORY } from '@/utils/constants';

const getBestIconMatch = (
  icon: string,
  isDirectory: boolean,
  ext: string,
  filePath: string
): string => {
  if (icon) return icon;

  return isDirectory
    ? '/icons/programs/explorer.png'
    : getFileIcon(filePath, ext);
};

export const getDirectoryEntry = async (
  fs: FSModule,
  path: string,
  file: string,
  getStats: boolean
): Promise<DirectoryEntry> => {
  const filePath = `${path}${
    path === ROOT_DIRECTORY ? '' : ROOT_DIRECTORY
  }${file}`;
  const ext = extname(file);
  const isDirectory = !ext;
  const stats =
    !isDirectory && getStats ? getFileStat(filePath) : ({} as FileStat);
  const isShortcut = !isDirectory && file.includes('.url');
  const { url, icon } = isShortcut
    ? await parseShortcut(fs, filePath)
    : ({} as Shortcut);

  return {
    name: file.replace(ext, ''),
    fullName: file,
    path: filePath,
    url: url && decodeURIComponent(url),
    icon: getBestIconMatch(icon, isDirectory, ext, filePath),
    size: isDirectory ? '--' : getFormattedSize(stats.size || 0),
    kind: isDirectory ? 'Folder' : getFileKind(ext)
  };
};

export const getDirectory = (
  fs: FSModule,
  path: string,
  getDetails: boolean,
  cb: (entries: DirectoryEntry[]) => void
): void => {
  fs?.readdir?.(path, (_error, contents = []) => {
    contents.reduce(async (entries, file) => {
      const newEntries = [
        ...(await entries),
        await getDirectoryEntry(fs, path, file, getDetails)
      ];

      cb(newEntries);

      return newEntries;
    }, Promise.resolve([]) as Promise<DirectoryEntry[]>);
  });
};
