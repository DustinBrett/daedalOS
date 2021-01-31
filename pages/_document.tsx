import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document from 'next/document';
import withServerStyleSheet from 'utils/withServerStyleSheet';

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return withServerStyleSheet(ctx);
  }
}

export default MyDocument;
