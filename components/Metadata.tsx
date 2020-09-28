import { name, description } from 'package.json';

import Head from 'next/head';
import { useEffect } from 'react';
import { lockDocumentTitle } from '@/utils/elements';

const Metadata: React.FC = () => {
  useEffect(lockDocumentTitle, []);

  return (
    <Head>
      <title>{name}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default Metadata;
