import type { FC } from 'react';

import { name } from '../package.json';

import Head from 'next/head';

export const MetaData: FC = () => (
  <Head>
    <title>{name}</title>
  </Head>
);
