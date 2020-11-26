import styles from '@/styles/Programs/Pdf.module.scss';

import type { AppComponent } from '@/types/utils/programs';

import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.js';

export const Pdf: React.FC<AppComponent> = ({
  file: { url = '/docs/resume.pdf' } = {}
}) => (
  <div className={styles.document}>
    <Document className={styles.reactDocument} file={url}>
      <Page pageNumber={1} scale={0.75} />
    </Document>
  </div>
);

export default Pdf;
