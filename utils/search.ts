import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import { useFileSystem } from "contexts/fileSystem";
import type { RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import type { Index } from "lunr";
import { extname } from "path";
import type React from "react";
import { useEffect, useRef } from "react";
import { loadFiles } from "utils/functions";

const FILE_INDEX = "/.index/search.lunr.json";
const LUNR_LIB = "/System/lunr/lunr.min.js";

let baseIndex = {} as Index;

export const search = async (
  searchTerm: string,
  index?: Index
): Promise<Index.Result[]> => {
  if (!window.lunr) await loadFiles([LUNR_LIB]);
  if (!index && !baseIndex.search) {
    const response = await fetch(FILE_INDEX);
    const indexFile = JSON.parse(await response.text()) as Index;

    baseIndex = window.lunr.Index.load(indexFile);
  }

  return (index ?? baseIndex).search?.(searchTerm.padEnd(4, "*")) ?? [];
};

const INDEX_EXTENSIONS = new Set([".md", ".txt", ".whtml"]);

const buildDynamicIndex = async (
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index> => {
  const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
  const overlayedFileSystems = overlayFs.getOverlayedFileSystems();
  const writable = overlayedFileSystems.writable as IndexedDBFileSystem;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const filesToIndex = Object.keys(writable?._cache?.map).filter((file) =>
    INDEX_EXTENSIONS.has(extname(file))
  );
  const indexedFiles = await Promise.all(
    filesToIndex.map(async (file) => ({
      name: file,
      text: (await readFile(file)).toString(),
    }))
  );
  const dynamicIndex = window.lunr(function buildIndex() {
    this.ref("name");
    this.field("text");
    indexedFiles.forEach((doc) => this.add(doc));
  });

  return window.lunr.Index.load(dynamicIndex.toJSON());
};

export const useSearch = (
  searchTerm: string
): React.MutableRefObject<Index.Result[]> => {
  const results = useRef<Index.Result[]>([] as Index.Result[]);
  const { readFile, rootFs } = useFileSystem();
  const addToResults = (searchResults: Index.Result[]): void => {
    if (searchResults.length > 0) {
      results.current = [...results.current, ...searchResults].sort(
        (a, b) => b.score - a.score
      );
    }
  };

  useEffect(() => {
    results.current = [];

    if (searchTerm.length > 0) {
      loadFiles([LUNR_LIB]).then(() => {
        search(searchTerm).then(addToResults);
        buildDynamicIndex(readFile, rootFs).then((dynamicIndex) =>
          search(searchTerm, dynamicIndex).then(addToResults)
        );
      });
    }
  }, [readFile, rootFs, searchTerm]);

  return results;
};
