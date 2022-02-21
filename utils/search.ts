import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import { useFileSystem } from "contexts/fileSystem";
import type { RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import type { Index } from "lunr";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import INDEX_EXTENSIONS from "scripts/indexExtensions.json";
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

  return (index ?? baseIndex).search?.(`${searchTerm}*`) ?? [];
};

interface IWritableFs extends Omit<IndexedDBFileSystem, "_cache"> {
  _cache: {
    map: Record<string, unknown>;
  };
}

const buildDynamicIndex = async (
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index> => {
  const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
  const overlayedFileSystems = overlayFs.getOverlayedFileSystems();
  const writable = overlayedFileSystems.writable as IWritableFs;
  const filesToIndex = Object.keys(writable?._cache?.map).filter((file) =>
    INDEX_EXTENSIONS.includes(extname(file))
  );
  const indexedFiles = await Promise.all(
    filesToIndex.map(async (path) => ({
      name: basename(path, extname(path)),
      path,
      text: (await readFile(path)).toString(),
    }))
  );
  const dynamicIndex = window.lunr(function buildIndex() {
    this.ref("path");
    this.field("name");
    this.field("text");
    indexedFiles.forEach((doc) => this.add(doc));
  });

  return window.lunr.Index.load(dynamicIndex.toJSON());
};

export const fullSearch = async (
  searchTerm: string,
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index.Result[]> => {
  const baseResult = await search(searchTerm);
  const dynamicIndex = await buildDynamicIndex(readFile, rootFs);
  const dynamicResult = await search(searchTerm, dynamicIndex);

  return [...baseResult, ...dynamicResult].sort((a, b) => b.score - a.score);
};

export const useSearch = (searchTerm: string): Index.Result[] => {
  const [results, setResults] = useState([] as Index.Result[]);
  const { readFile, rootFs } = useFileSystem();

  useEffect(() => {
    if (searchTerm.length > 0) {
      loadFiles([LUNR_LIB]).then(() => {
        search(searchTerm).then(setResults);
        buildDynamicIndex(readFile, rootFs).then((dynamicIndex) =>
          search(searchTerm, dynamicIndex).then((searchResults) =>
            setResults((currentResults) =>
              [...currentResults, ...searchResults].sort(
                (a, b) => b.score - a.score
              )
            )
          )
        );
      });
    } else {
      setResults([]);
    }
  }, [readFile, rootFs, searchTerm]);

  return results;
};
