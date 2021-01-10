import type { AppProps } from 'next/app';
import Head from 'next/head';
import { description, name } from 'package.json';
import type { ReactElement } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import defaultTheme from 'themes/default.json';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }
`;

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <>
      <Head>
        <title>{name}</title>
        <meta name="description" content={description} />
      </Head>
      <GlobalStyle />
      <ThemeProvider theme={defaultTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
