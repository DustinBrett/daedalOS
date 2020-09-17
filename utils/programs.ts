import type { AppLoader } from '@/utils/programs.d';

import dynamic from 'next/dynamic';
import { extname } from 'path';
import { isValidUrl } from '@/utils/url';

import { loaderOptions as dosLoaderOptions } from '@/components/Programs/Dos';
import { loaderOptions as explorerLoaderOptions } from '@/components/Programs/Explorer';
import { loaderOptions as pdfLoaderOptions } from '@/components/Programs/Pdf';
import { loaderOptions as winampLoaderOptions } from '@/components/Programs/Winamp';

const Dos = dynamic(import('@/components/Programs/Dos')),
  Explorer = dynamic(import('@/components/Programs/Explorer')),
  Pdf = dynamic(import('@/components/Programs/Pdf')),
  Winamp = dynamic(import('@/components/Programs/Winamp'));

const appLoaderByName = (name: string): AppLoader | undefined => {
  switch (name) {
    case 'dos':
      return {
        loader: Dos,
        loaderOptions: dosLoaderOptions
      };
    case 'explorer':
      return {
        loader: Explorer,
        loaderOptions: explorerLoaderOptions
      };
    case 'pdf':
      return {
        loader: Pdf,
        loaderOptions: pdfLoaderOptions
      };
    case 'winamp':
      return {
        loader: Winamp,
        loaderOptions: winampLoaderOptions
      };
  }
};

const appLoaderByFileType = (
  path: string,
  searchParams?: URLSearchParams,
  ext?: string
): AppLoader | undefined => {
  switch (ext || extname(path)) {
    case '.jsdos':
      return {
        loader: Dos,
        loaderOptions: dosLoaderOptions,
        loadedAppOptions: {
          url: path,
          args: searchParams ? [...searchParams.entries()].flat() : []
        }
      };
    case '.mp3':
    case '.m3u':
    case '.wsz':
      return {
        loader: Winamp,
        loaderOptions: winampLoaderOptions,
        loadedAppOptions: {
          url: path
        }
      };
    case '.pdf':
      return {
        loader: Pdf,
        loaderOptions: pdfLoaderOptions,
        loadedAppOptions: {
          url: path
        }
      };
  }
};

export const appLoader = (url: string, name: string): AppLoader | undefined => {
  console.log(url, name);
  if (isValidUrl(url)) {
    const { pathname, searchParams } = new URL(url);

    return pathname === '/'
      ? appLoaderByName(searchParams.get('app') || '')
      : appLoaderByFileType(pathname, searchParams, extname(name));
  }

  return appLoaderByFileType(url); // Q: When would this occur?
};
