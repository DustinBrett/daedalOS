import type { Index } from "lunr";
import { loadFiles } from "utils/functions";

const FILE_INDEX = "/.index/search.lunr.json";
const LUNR_LIB = "/System/lunr/lunr.min.js";

let searchIndex = {} as Index;

export const search = async (searchTerm: string): Promise<Index.Result[]> => {
  if (!window.lunr) await loadFiles([LUNR_LIB]);
  if (!searchIndex.search) {
    const response = await fetch(FILE_INDEX);
    const indexFile = JSON.parse(await response.text()) as Index;

    searchIndex = window.lunr.Index.load(indexFile);
  }

  return searchIndex.search?.(searchTerm) ?? [];
};
