import 'styles/globals.scss';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { name } from 'package.json';
import type { ReactElement } from 'react';

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <>
      <Head>
        <title>{name}</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
