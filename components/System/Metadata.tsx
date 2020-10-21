import { description, name } from 'package.json';

import Head from 'next/head';
import { lockDocumentTitle } from '@/utils/elements';
import { memo, useEffect } from 'react';

const Metadata: React.FC = () => {
  useEffect(lockDocumentTitle, []);

  return (
    <Head>
      <title>{name}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default memo(Metadata);
