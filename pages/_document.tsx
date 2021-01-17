import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import type { ReactElement } from 'react';
import withServerStyleSheet from 'utils/withServerStyleSheet';

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return withServerStyleSheet(ctx);
  }

  render(): ReactElement {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
