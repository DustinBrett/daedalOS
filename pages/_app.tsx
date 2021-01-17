import Metadata from 'components/pages/Metadata';
import StyledApp from 'components/pages/StyledApp';
import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <>
      <Metadata />
      <StyledApp>
        <Component {...pageProps} />
      </StyledApp>
    </>
  );
}
