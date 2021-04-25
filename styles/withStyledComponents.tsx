import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document from 'next/document';
import { ServerStyleSheet } from 'styled-components';

const withStyledComponents = async (
  ctx: DocumentContext
): Promise<DocumentInitialProps> => {
  const { renderPage } = ctx;
  const sheet = new ServerStyleSheet();

  try {
    ctx.renderPage = () =>
      renderPage({
        enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />)
      });

    const { styles, ...initialProps } = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [styles, sheet.getStyleElement()]
    };
  } finally {
    sheet.seal();
  }
};

export default withStyledComponents;
