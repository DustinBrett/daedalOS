import ExplorerIcon from '@/public/icons/apps/explorer.png';
import UnknownFileTypeIcon from '@/public/icons/types/unknown.png';

import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { DirectoryEntry } from '@/components/System/Directory/Directory';

import * as ini from 'ini';
import { formatToLongDateTime } from '@/utils/dates';

const bytesInKB = 1024,
  fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  homeDir = '/';

type StatsProto = {
  isDirectory: () => boolean;
};

type Shortcut = {
  url: string;
  icon: string;
};

const parseShortcut = (fs: FSModule, path: string): Promise<Shortcut> =>
  new Promise((resolve) => {
    fs?.readFile?.(path, (_error, fileBuffer) => {
      const {
        InternetShortcut: { URL: url, IconFile }
      } = ini.parse(fileBuffer?.toString() || '');

      resolve({ url, icon: new URL(IconFile).pathname });
    });
  });

const getDirectoryEntry = async (
  fs: FSModule,
  path: string,
  file: string
): Promise<DirectoryEntry> => {
  const filePath = `${path}${path === homeDir ? '' : '/'}${file}`,
    stats = await getFileStat(fs, filePath),
    { mtime, size } = stats || {},
    ext = getFileExtension(file),
    isDirectory = stats?.isDirectory() || false,
    isShortcut = !isDirectory && file.includes('.url'),
    { url, icon } = isShortcut
      ? await parseShortcut(fs, filePath)
      : ({} as Shortcut);

  return {
    name: file.replace(`.${ext}`, ''),
    fullName: file,
    path: filePath,
    url: url && decodeURIComponent(url),
    icon: icon ? icon : isDirectory ? ExplorerIcon : getFileIcon(ext),
    mtime: mtime && formatToLongDateTime(mtime),
    size: isDirectory ? '--' : getFormattedSize(size),
    kind: isDirectory ? 'Folder' : getFileKind(ext)
  };
};

const getFileIcon = (ext: string): string => {
  switch (ext) {
    default:
      return UnknownFileTypeIcon;
  }
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
    case 'url':
      return 'Internet Shortcut';
    default:
      return '';
  }
};

const getFileStat = (fs: FSModule, path: string): Promise<Stats & StatsProto> =>
  new Promise((resolve) => fs?.stat?.(path, (_error, stats) => resolve(stats)));

const getFormattedSize = (size: number): string => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB)),
    newSize = Math.round(size / Math.pow(bytesInKB, sizeFactor));

  return `${newSize} ${fileSizes[sizeFactor]}`;
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

export const getFileExtension = (path = ''): string => {
  const [, ...ext] = path?.split?.('/')?.pop?.()?.split?.('.') || [];

  return (ext || []).join();
};
