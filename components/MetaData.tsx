import type { FC } from 'react';
import Head from 'next/head';
import { name } from '../package.json';

export const MetaData: FC = () => {
  return (
    <Head>
      <title>{ name }</title>
    </Head>
  );
};
