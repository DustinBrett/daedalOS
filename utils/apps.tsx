import type { ReactElement } from 'react';

import { DosAppLoader } from '@/components/Apps/Dos';
import { getFileExtension } from '@/utils/files';

const getAppComponentByName = (name: string): ReactElement | undefined => {
  switch (name) {
    case 'dos':
      return <DosAppLoader />;
  }
};

const getAppComponentByFileType = (
  path: string,
  searchParams: URLSearchParams
): ReactElement | undefined => {
  switch (getFileExtension(path)) {
    case 'jsdos':
      return (
        <DosAppLoader url={path} args={[...searchParams.entries()].flat()} />
      );
  }
};

export const getAppComponent = (url: string): ReactElement | undefined => {
  const { pathname, searchParams } = new URL(url);

  return pathname === '/'
    ? getAppComponentByName(searchParams.get('app') || '')
    : getAppComponentByFileType(pathname, searchParams);
};
