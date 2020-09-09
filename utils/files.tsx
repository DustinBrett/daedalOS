import ExplorerIcon from '@/public/icons/apps/explorer.png';

import JsFileTypeIcon from '@/public/icons/types/js.svg';
import PdfFileTypeIcon from '@/public/icons/types/pdf.svg';
import UnknownFileTypeIcon from '@/public/icons/types/unknown.svg';

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

type Shortcut = {
  url: string;
  icon: string;
};

const parseShortcut = (fs: FSModule, path: string): Promise<Shortcut> =>
  new Promise((resolve) => {
    fs?.readFile?.(path, (_error, fileBuffer) => {
      import('ini').then(({ default: ini }) => {
        const {
          InternetShortcut: { URL: url, IconFile }
        } = ini.parse(fileBuffer?.toString() || '');

        resolve({ url, icon: new URL(IconFile).pathname });
      });
    });
  });

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
    // Get rid of isDirectory and just check for extension (eventually using path logic)
    stats = getStats
      ? await getFileStat(fs, filePath)
      : ({} as Stats & StatsProto),
    { mtime, size } = stats || {},
    ext = getFileExtension(file),
    isDirectory = stats?.isDirectory?.() || false,
    isShortcut = !isDirectory && file.includes('.url'),
    { url, icon } = isShortcut
      ? await parseShortcut(fs, filePath)
      : ({} as Shortcut);

  return {
    name: file.replace(`.${ext}`, ''),
    fullName: file,
    path: filePath,
    url: url && decodeURIComponent(url),
    icon: getBestIconMatch(icon, isDirectory, ext, filePath),
    mtime: mtime && formatToLongDateTime(mtime),
    size: isDirectory ? '--' : getFormattedSize(size),
    kind: isDirectory ? 'Folder' : getFileKind(ext)
  };
};

const getFileIcon = (filePath: string, ext: string): string => {
  switch (ext) {
    case 'png':
    case 'ico':
    case 'svg':
      return filePath;
    case 'jsdos':
      return '/icons/apps/dos.png';
    // TODO: *.js
    case 'js':
    case 'json':
    case 'min.js':
    case 'wasm.js':
    case 'worker.js':
      return JsFileTypeIcon;
    // TODO: Winamp file type icons
    case 'mp3':
    case 'm3u':
    case 'wsz':
      return '/icons/apps/winamp.png';
    case 'pdf':
      return PdfFileTypeIcon;
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
  getDetails: boolean,
  cb: (entries: Array<DirectoryEntry>) => void // Dispatch?
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

export const getFileExtension = (path = ''): string => {
  const [, ...ext] = path?.split?.('/')?.pop?.()?.split?.('.') || [];

  return ext.length >= 2 ? ext.slice(ext.length - 2).join('.') : ext[0] || '';
};
