import type { AppLoader } from '@/utils/apps.d';

import dynamic from 'next/dynamic';
import { getFileExtension } from '@/utils/file';
import { isValidUrl } from '@/utils/url';

import { loaderOptions as dosLoaderOptions } from '@/components/Apps/Dos';
import { loaderOptions as explorerLoaderOptions } from '@/components/Apps/Explorer';
import { loaderOptions as pdfLoaderOptions } from '@/components/Apps/Pdf';
import { loaderOptions as winampLoaderOptions } from '@/components/Apps/Winamp';

const Dos = dynamic(import('@/components/Apps/Dos')),
  Explorer = dynamic(import('@/components/Apps/Explorer')),
  Pdf = dynamic(import('@/components/Apps/Pdf')),
  Winamp = dynamic(import('@/components/Apps/Winamp'));

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
  searchParams?: URLSearchParams
): AppLoader | undefined => {
  switch (getFileExtension(path)) {
    case 'jsdos':
      return {
        loader: Dos,
        loaderOptions: dosLoaderOptions,
        loadedAppOptions: {
          url: path,
          args: searchParams ? [...searchParams.entries()].flat() : []
        }
      };
    case 'mp3':
    case 'm3u':
    case 'wsz':
      return {
        loader: Winamp,
        loaderOptions: winampLoaderOptions,
        loadedAppOptions: {
          url: path
        }
      };
    case 'pdf':
      return {
        loader: Pdf,
        loaderOptions: pdfLoaderOptions,
        loadedAppOptions: {
          url: path
        }
      };
  }
};

export const appLoader = (url: string): AppLoader | undefined => {
  if (isValidUrl(url)) {
    const { pathname, searchParams } = new URL(url);

    return pathname === '/'
      ? appLoaderByName(searchParams.get('app') || '')
      : appLoaderByFileType(pathname, searchParams);
  }

  return appLoaderByFileType(url);
};
