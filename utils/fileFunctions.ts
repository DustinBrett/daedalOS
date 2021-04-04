import type { FSModule } from 'browserfs/dist/node/core/FS';
import ini from 'ini';

type Shortcut = {
  BaseURL: string;
  IconFile: string;
  URL: string;
};

export const getShortcut = (path: string, fs: FSModule): Promise<Shortcut> =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (error, contents = Buffer.from('')) => {
      if (error) {
        reject(error);
      } else {
        const {
          InternetShortcut = { BaseURL: '', IconFile: '', URL: '' }
        } = ini.parse(contents.toString());

        resolve(InternetShortcut as Shortcut);
      }
    });
  });

export const getIconByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return '/icons/image.ico';
    default:
      return '/icons/unknown.ico';
  }
};

export const getProcessByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return 'V86';
    default:
      return '';
  }
};

export const loadScript = (src: string, callback: () => void): void => {
  const script = document.createElement('script');

  script.src = src;
  script.onload = () => callback?.();

  document.head.appendChild(script);
};

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(new Blob([new Uint8Array(buffer)]));
