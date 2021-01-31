import Metadata from 'components/pages/Metadata';
import StyledApp from 'components/pages/StyledApp';
import { SessionProvider } from 'contexts/session';
import type { AppProps } from 'next/app';
import { description, name } from 'package.json';
import type { ReactElement } from 'react';
import themes from 'styles/themes.json';

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <>
      <Metadata description={description} title={name} />
      <SessionProvider>
        <StyledApp currentTheme={themes.default}>
          <Component {...pageProps} />
        </StyledApp>
      </SessionProvider>
    </>
  );
}
