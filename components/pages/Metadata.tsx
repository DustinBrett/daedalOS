import Head from 'next/head';
import { description, name } from 'package.json';
import type { FC } from 'react';

const Metadata: FC = () => (
  <Head>
    <meta name="description" content={description} />
    <title>{name}</title>
  </Head>
);

export default Metadata;
