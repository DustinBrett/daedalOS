import type { ReactElement } from 'react';

import { DosAppLoader } from '@/components/Apps/Dos';
import { getFileExtension } from '@/utils/files';

const getAppComponent = (url: string): ReactElement | undefined => {
  const { pathname, searchParams } = new URL(url);

  switch (getFileExtension(pathname)) {
    case 'jsdos':
      return (
        <DosAppLoader
          url={pathname}
          args={[...searchParams.entries()].flat()}
        />
      );
  }
};
