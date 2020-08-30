import '@/styles/globals.scss';

import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';

// TODO: Add Sentry for crashes in wild

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return <Component {...pageProps} />;
}
