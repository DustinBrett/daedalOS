import { name, description } from 'package.json';

import type { FC } from 'react';

import Head from 'next/head';
import { useEffect } from 'react';
import { lockDocumentTitle } from '@/utils/utils';

export const Metadata: FC = () => {
  useEffect(() => {
    lockDocumentTitle();
  }, []);

  return (
    <Head>
      <title>{name}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default Metadata;
