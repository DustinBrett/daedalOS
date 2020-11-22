import { FileStat, ListingStat } from '@/types/utils/filesystem';

import publicStats from 'public_stats.json';

const bytesInKB = 1024;
const fileSizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];

export const getFileIcon = (filePath: string, ext: string): string => {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.ico':
    case '.svg':
      return filePath;
    case '.jsdos':
      return '/icons/programs/dos.png';
    case '.js':
    case '.json':
      return '/icons/files/js.svg';
    case '.mp3':
    case '.m3u':
    case '.wsz':
      return '/icons/programs/winamp.png';
    default:
      return '/icons/files/unknown.svg';
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

export const getFileStat = (path: string): FileStat =>
  (publicStats as ListingStat)[path] || {};

export const getFormattedSize = (size: number): string => {
  if (size === -1) return 'Unknown';
  if (size === 0) return 'Zero bytes';
  if (size === 1) return '1 byte';

  const sizeFactor = Math.floor(Math.log(size) / Math.log(bytesInKB));
  const newSize = Math.round(size / bytesInKB ** sizeFactor);

  return `${newSize} ${fileSizes[sizeFactor]}`;
};
