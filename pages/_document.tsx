import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document from 'next/document';
import withStyledComponents from 'utils/withStyledComponents';

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return withStyledComponents(ctx);
  }
}

export default MyDocument;
