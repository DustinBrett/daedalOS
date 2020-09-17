import ExplorerIcon from '@/public/icons/programs/explorer.png';

import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { DirectoryEntry } from '@/components/System/Directory/Directory.d';
import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { Shortcut } from '@/utils/shortcut.d';
import type { StatsProto } from '@/utils/directory.d';

import { extname } from 'path';
import {
  getFileKind,
  getFileIcon,
  getFormattedSize,
  getFileStat
} from '@/utils/file';
import { parseShortcut } from '@/utils/shortcut';

const homeDir = '/';

const getBestIconMatch = (
  icon: string,
  isDirectory: boolean,
  ext: string,
  filePath: string
): string => {
  if (icon) return icon;

  return isDirectory ? ExplorerIcon : getFileIcon(filePath, ext);
};

const getDirectoryEntry = async (
  fs: FSModule,
  path: string,
  file: string,
  getStats: boolean
): Promise<DirectoryEntry> => {
  const filePath = `${path}${path === homeDir ? '' : '/'}${file}`,
    ext = extname(file),
    isDirectory = !ext,
    stats =
      !isDirectory && getStats
        ? await getFileStat(fs, filePath)
        : ({} as Stats & StatsProto),
    { size } = stats || {},
    isShortcut = !isDirectory && file.includes('.url'),
    { url, icon } = isShortcut
      ? await parseShortcut(fs, filePath)
      : ({} as Shortcut);

  return {
    name: file.replace(ext, ''),
    fullName: file,
    path: filePath,
    url: url && decodeURIComponent(url),
    icon: getBestIconMatch(icon, isDirectory, ext, filePath),
    size: isDirectory ? '--' : getFormattedSize(size),
    kind: isDirectory ? 'Folder' : getFileKind(ext)
  };
};

export const getDirectory = (
  fs: FSModule,
  path: string,
  getDetails: boolean,
  cb: (entries: Array<DirectoryEntry>) => void
): void => {
  fs?.readdir?.(path, (_error, contents = []) => {
    contents.reduce(async (entries, file) => {
      const newEntries = [
        ...(await entries),
        await getDirectoryEntry(fs, path, file, getDetails)
      ];

      cb(newEntries);

      return newEntries;
    }, Promise.resolve([]) as Promise<Array<DirectoryEntry>>);
  });
};
