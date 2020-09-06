import type { ReactElement } from 'react';

import { DosAppLoader } from '@/components/Apps/Dos';
import { getFileExtension } from '@/utils/files';

const getAppComponentByName = (
  name: string,
  searchParams: URLSearchParams
): ReactElement | undefined => {
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
  const { hash, pathname, searchParams } = new URL(url);

  return hash
    ? getAppComponentByName(hash.replace('#', ''), searchParams)
    : getAppComponentByFileType(getFileExtension(pathname), searchParams);
};
