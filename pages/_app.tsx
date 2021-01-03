import 'styles/globals.scss';

import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';

export default function MyApp({ Component, pageProps }: AppProps): ReactElement {
  return <Component {...pageProps} />;
}
