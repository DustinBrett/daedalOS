import type { DocumentContext, DocumentInitialProps } from 'next/document';
import type { ReactElement } from 'react';

import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class AppDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return Document.getInitialProps(ctx);
  }

  render(): ReactElement {
    return (
      <Html lang={process.env.lang}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
