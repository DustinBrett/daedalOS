import { name } from 'package.json';

import type { FC } from 'react';
import Head from 'next/head';

export const MetaData: FC = () => (
  <Head>
    <title>{name}</title>
  </Head>
);
