import { name } from 'package.json';

import type { FC } from 'react';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

export const Metadata: FC = () => {
  const Head = dynamic(import('next/head'));

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
