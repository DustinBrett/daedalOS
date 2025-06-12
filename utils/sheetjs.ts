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
    await loadFiles(["/System/SheetJS/xlsx.full.min.js"]);
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
    await loadFiles(["/System/SheetJS/xlsx.zahl.js"]);

    if (!window.XLSX_ZAHL_PAYLOAD) return Buffer.from("");

    numbers = window.XLSX_ZAHL_PAYLOAD;
  }

  return sheetJs.write(sheetJs.read(fileData), {
    bookType: extension as XLSX.BookType,
    numbers,
    type: "buffer",
  }) as Uint8Array;
};
