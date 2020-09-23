import JsFileTypeIcon from '@/public/icons/files/js.svg';
import UnknownFileTypeIcon from '@/public/icons/files/unknown.svg';

import type { Stats } from 'browserfs/dist/node/generic/emscripten_fs';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import type { StatsProto } from '@/utils/directory.d';

const bytesInKB = 1024,
  fileSizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];

export const getFileIcon = (filePath: string, ext: string): string => {
  switch (ext) {
    case '.png':
    case '.ico':
    case '.svg':
      return filePath;
    case '.jsdos':
      return '/icons/programs/dos.png';
    case '.js':
    case '.json':
      return JsFileTypeIcon;
    case '.mp3':
    case '.m3u':
    case '.wsz':
      return '/icons/programs/winamp.png';
    default:
      return UnknownFileTypeIcon;
  }
};

export const getFileKind = (ext: string): string => {
  switch (ext) {
    case '.txt':
      return 'Plain Text';
    case '.json':
      return 'JSON Document';
    case '.ico':
      return 'Icon Image';
    case '.woff2':
      return 'Web Font';
    case '.zip':
      return 'ZIP Archive';
    case '.mp3':
      return 'MP3 Audio';
    case '.js':
      return 'JS Document';
    case '.wsz':
      return 'Winamp Skin';
    case '.url':
      return 'Shortcut';
    default:
      return '';
  }
};

export const getFileStat = (
  fs: FSModule,
  path: string
): Promise<Stats & StatsProto> =>
  new Promise((resolve) => fs?.stat?.(path, (_error, stats) => resolve(stats)));

export const getFormattedSize = (size: number): string => {
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB)),
    newSize = Math.round(size / Math.pow(bytesInKB, sizeFactor));

  return `${newSize} ${fileSizes[sizeFactor]}`;
};
