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

// Could this become AppsContext?
// import { run, AppsContext } from '@/contexts/apps';
// const { apps, updateApp } = useContext(AppsContext)
// run = getAppComponent
// { apps, updateApp }
// Could I not use updateApp and instead run funcs exported from AppsContext which mutate `apps` locally within its module?

export const getAppComponent = (url: string): ReactElement | undefined => {
  const { pathname, searchParams } = new URL(url);

  return pathname === '/'
    ? getAppComponentByName(searchParams.get('app') || '')
    : getAppComponentByFileType(pathname, searchParams);
};
