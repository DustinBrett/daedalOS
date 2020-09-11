import styles from '@/styles/Apps/Pdf.module.scss';

import type { FC } from 'react';

import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { AppComponent } from '@/contexts/App';

const baseWidth = 400;

export const Pdf: FC<AppComponent> = ({ url = '/' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <>
      <div className={styles.controls}>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          Previous
        </button>
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </p>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(zoom + 0.25);
          }}
        >
          Zoom In
        </button>
        <p>Zoom {zoom * 100}%</p>
        <button
          type="button"
          onClick={() => {
            setZoom(zoom - 0.25);
          }}
        >
          Zoom Out
        </button>
      </div>
      <div className={styles.document}>
        <Document
          className={styles.reactDocument}
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} width={baseWidth * zoom} />
        </Document>
      </div>
    </>
  );
};

export default Pdf;
