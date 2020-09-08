import type { FC } from 'react';

import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { AppComponent } from '@/contexts/App';

const baseWidth = 400;

export const PdfLoader: FC<AppComponent> = ({ url = '/' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        // options={{
        //   cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
        //   cMapPacked: true,
        // }}
      >
        <Page pageNumber={pageNumber} width={baseWidth * zoom} />
      </Document>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </p>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => {setZoom(1.25)}}
        >
          Zoom 125%
        </button>
      </div>
    </>
  );
};
