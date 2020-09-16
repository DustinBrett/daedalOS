// import styles from '@/styles/Programs/Pdf.module.scss';

import type { FC } from 'react';
import type { AppComponent } from '@/utils/programs.d';

// import React, { useState } from 'react';
// import { pdfjs, Document, Page } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.js';

// TODO: Fix `window` error on (server?) builds

export const loaderOptions = {
  hideScrollbars: true,
  height: 700,
  width: 520,
  bgColor: '#d7d7d7'
};

export const Pdf: FC<AppComponent> = ({ url = '/' }) => {
  return <></>; // TODO: Fix `window` loading issue
  // const [numPages, setNumPages] = useState<number>(0);
  // const [pageNumber, setPageNumber] = useState(1);
  // const [zoom, setZoom] = useState(0.75);
  // function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
  //   setNumPages(numPages);
  //   setPageNumber(1);
  // }
  // function changePage(offset: number) {
  //   setPageNumber((prevPageNumber) => prevPageNumber + offset);
  // }
  // function previousPage() {
  //   changePage(-1);
  // }
  // function nextPage() {
  //   changePage(1);
  // }
  // return (
  //   <>
  //     <div className={styles.controls}>
  //       <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
  //         Previous
  //       </button>
  //       <p>
  //         Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
  //       </p>
  //       <button
  //         type="button"
  //         disabled={pageNumber >= numPages}
  //         onClick={nextPage}
  //       >
  //         Next
  //       </button>
  //       <button
  //         type="button"
  //         onClick={() => {
  //           setZoom(zoom + 0.25);
  //         }}
  //       >
  //         Zoom In
  //       </button>
  //       <p>Zoom {zoom * 100}%</p>
  //       <button
  //         type="button"
  //         onClick={() => {
  //           setZoom(zoom - 0.25);
  //         }}
  //       >
  //         Zoom Out
  //       </button>
  //     </div>
  //     <div className={styles.document}>
  //       <Document
  //         className={styles.reactDocument}
  //         file={url}
  //         onLoadSuccess={onDocumentLoadSuccess}
  //       >
  //         <Page pageNumber={pageNumber} scale={zoom} />
  //       </Document>
  //     </div>
  //   </>
  // );
};

export default Pdf;
