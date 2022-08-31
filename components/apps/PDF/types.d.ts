import type * as PdfjsLib from "pdfjs-dist";

declare global {
  interface Window {
    pdfjsLib?: typeof PdfjsLib;
  }
}

export type MetadataInfo = { Title?: string };

declare module "print-js" {
  const printJs: (options: {
    base64: boolean;
    printable: string;
    type: "pdf";
  }) => void;

  export default printJs;
}
