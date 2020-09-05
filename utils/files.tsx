import ExplorerIcon from '@/assets/icons/Explorer.png';
import UnknownFileIcon from '@/assets/icons/Unknown.png';

import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { DirectoryEntry } from '@/components/System/Directory/Directory';

import { formatToLongDateTime } from '@/utils/dates';

const bytesInKB = 1024,
  fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  homeDir = '/';

type StatsProto = {
  isDirectory: () => boolean;
};

const getDirectoryEntry = async (
  fs: FSModule,
  path: string,
  file: string
): Promise<DirectoryEntry> => {
  const filePath = `${path}${path === homeDir ? '' : '/'}${file}`,
    stats = await getFileStat(fs, filePath),
    { mtime, size } = stats || {},
    isDirectory = stats?.isDirectory() || false;

  return {
    name: file,
    path: filePath,
    icon: isDirectory ? ExplorerIcon : getFileIcon(getFileExtension(name)),
    mtime,
    formattedModifiedTime: mtime && formatToLongDateTime(mtime),
    size,
    formattedSize: isDirectory ? '--' : getFormattedSize(size),
    isDirectory,
    kind: isDirectory ? 'Folder' : getFileKind(getFileExtension(name))
  };
};

const getFileStat = (fs: FSModule, path: string): Promise<Stats & StatsProto> =>
  new Promise((resolve) => fs?.stat?.(path, (_error, stats) => resolve(stats)));

const getFileIcon = (ext: string): string => {
  switch (ext) {
    default:
      return UnknownFileIcon;
  }
};

const getFileExtension = (path = ''): string =>
  (path?.split('.')?.pop() || '')?.toLowerCase(); // TODO: Use path.extname

const getFormattedSize = (size: number): string => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB)),
    newSize = Math.round(size / Math.pow(bytesInKB, sizeFactor));

  return `${newSize} ${fileSizes[sizeFactor]}`;
};

const getFileKind = (ext: string): string => {
  switch (ext) {
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
    default:
      return '';
  }
};

export const getDirectory = (
  fs: FSModule,
  path: string,
  cb: (entries: Array<DirectoryEntry>) => void
): void => {
  fs?.readdir?.(path, async (_error, contents = []) => {
    cb(
      await Promise.all(
        contents.map((file) => getDirectoryEntry(fs, path, file))
      )
    );
  });
};
