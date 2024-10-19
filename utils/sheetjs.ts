import type * as XLSX from "xlsx";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    XLSX: typeof XLSX;
    XLSX_ZAHL_PAYLOAD?: string;
  }
}

const getSheetJs = async (): Promise<typeof XLSX> => {
  if (!window.XLSX) {
    await loadFiles(["/Program Files/SheetJS/xlsx.full.min.js"]);
  }

  return window.XLSX;
};

export const convertSheet = async (
  fileData: Buffer,
  extension: string
): Promise<Uint8Array> => {
  const sheetJs = await getSheetJs();
  let numbers: string | undefined;

  if (extension === "numbers") {
    await loadFiles(["/Program Files/SheetJS/xlsx.zahl.js"]);

    if (!window.XLSX_ZAHL_PAYLOAD) return Buffer.from("");

    numbers = window.XLSX_ZAHL_PAYLOAD;
  }

  // eslint-disable-next-line no-undef-init
  let sheet: Uint8Array | undefined = undefined;

  try {
    sheet = sheetJs.write(sheetJs.read(fileData), {
      bookType: extension as XLSX.BookType,
      numbers,
      type: "buffer",
    }) as Uint8Array;
  } catch {
    // Ignore failure to read/write sheet
  }

  return sheet || Buffer.from("");
};
