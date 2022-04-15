import { loadFiles } from "utils/functions";
import type * as XLSX from "xlsx";

declare global {
  interface Window {
    XLSX: typeof XLSX;
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

  return sheetJs.write(sheetJs.read(fileData), {
    bookType: extension as XLSX.BookType,
    type: "buffer",
  }) as Uint8Array;
};
