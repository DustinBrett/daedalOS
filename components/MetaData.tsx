import { name } from 'package.json';

import type { FC } from 'react';
import Head from 'next/head';

// TODO: Favicon
export const MetaData: FC = () => (
  <Head>
    <title>{name}</title>
  </Head>
);
