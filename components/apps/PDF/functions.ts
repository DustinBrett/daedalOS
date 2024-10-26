import { type TextItem } from "pdfjs-dist/types/src/display/api";
import { loadFiles } from "utils/functions";

export const readPdfText = async (pdfDoc: Buffer): Promise<string> => {
  await loadFiles(["/Program Files/PDF.js/pdf.js"]);

  let text = "";

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "/Program Files/PDF.js/pdf.worker.js";

    try {
      const doc = await window.pdfjsLib.getDocument(pdfDoc).promise;

      for (let p = 0; p < doc.numPages; p += 1) {
        // eslint-disable-next-line no-await-in-loop
        const content = await (await doc.getPage(p + 1)).getTextContent();

        text += content.items
          .map((item) => (item as TextItem).str || "")
          .filter(Boolean)
          .join(" ");
      }
    } catch {
      // Ignore failure to read PDF
    }
  }

  return text;
};
