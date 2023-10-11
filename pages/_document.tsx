import type { DocumentContext, DocumentInitialProps } from "next/document";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import { ServerStyleSheet } from "styled-components";
import { DEFAULT_LOCALE } from "utils/constants";

const withStyledComponents = async (
  ctx: DocumentContext
): Promise<DocumentInitialProps> => {
  const { renderPage } = ctx;
  const sheet = new ServerStyleSheet();

  try {
    ctx.renderPage = () =>
      renderPage({
        enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
      });

    const { styles, ...initialProps } = await NextDocument.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [styles, sheet.getStyleElement()],
    };
  } finally {
    sheet.seal();
  }
};

class Document extends NextDocument {
  public static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return withStyledComponents(ctx);
  }

  public render(): React.JSX.Element {
    return (
      <Html lang={DEFAULT_LOCALE}>
        <Head />
        <body>
          <Script id="initHeight" strategy="beforeInteractive">
            window.initialHeight = window.innerHeight;
          </Script>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
