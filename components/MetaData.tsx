import { name } from 'package.json';

import type { FC } from 'react';

import Head from 'next/head';
import { useEffect } from 'react';

export const Metadata: FC = () => {
  useEffect(() => {
    import('@/utils/utils').then(({ lockDocumentTitle }) => {
      lockDocumentTitle();
    });
  }, []);

  return (
    <Head>
      <title>{name}</title>
    </Head>
  );
};

export default Metadata;
