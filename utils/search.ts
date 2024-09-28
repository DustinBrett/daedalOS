import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { type Index } from "lunr";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import { useFileSystem } from "contexts/fileSystem";
import { type RootFileSystem } from "contexts/fileSystem/useAsyncFs";
import SEARCH_EXTENSIONS from "scripts/searchExtensions.json";
import {
  DISBALE_AUTO_INPUT_FEATURES,
  HIGH_PRIORITY_REQUEST,
} from "utils/constants";
import { getExtension, loadFiles } from "utils/functions";

export const FILE_INDEX = "/.index/search.lunr.json";

export const SEARCH_LIB = "/System/lunr/lunr.min.js";

export const SEARCH_INPUT_PROPS = {
  "aria-label": "Search",
  enterKeyHint: "search",
  inputMode: "search",
  name: "search",
  type: "search",
  ...DISBALE_AUTO_INPUT_FEATURES,
} as React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

let baseIndex = Object.create(null) as Index;
let basePaths = [] as string[];

type ResponseIndex = Index & {
  paths: string[];
};

const search = async (
  searchTerm: string,
  index?: Index
): Promise<Index.Result[]> => {
  if (!window.lunr) await loadFiles([SEARCH_LIB]);
  if (!index && !baseIndex?.search) {
    const response = await fetch(FILE_INDEX, HIGH_PRIORITY_REQUEST);

    try {
      const { paths, ...responseIndex } = JSON.parse(
        await response.text()
      ) as ResponseIndex;

      baseIndex = window.lunr?.Index.load(responseIndex);
      basePaths = paths;
    } catch {
      // Failed to parse text data to JSON
    }
  }

  const searchIndex = index ?? baseIndex;
  let results: Index.Result[] = [];
  const normalizedSearchTerm = searchTerm
    .trim()
    .replace(/\./g, " ")
    .replace(/\*~\^-\+/g, "");

  try {
    results = searchIndex.search?.(normalizedSearchTerm);

    if (results?.length === 0) {
      results = searchIndex.search?.(
        `${normalizedSearchTerm.split(" ").join("* ")}*`
      );
    }
  } catch {
    // Ignore search errors
  }

  if (results) {
    return results.map((result) => ({
      ...result,
      ref:
        (Object.prototype.hasOwnProperty.call(basePaths, result.ref)
          ? (basePaths[result.ref as keyof typeof basePaths] as string)
          : result.ref) || "",
    }));
  }

  return [];
};

interface IWritableFs extends Omit<IndexedDBFileSystem, "_cache"> {
  _cache: {
    map: Map<string, unknown>;
  };
}

const buildDynamicIndex = async (
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index> => {
  const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
  const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
  const writable = overlayedFileSystems?.writable as IWritableFs;

  const writableFiles =
    (typeof writable?._cache?.map?.keys === "function" && [
      ...writable._cache.map.keys(),
    ]) ||
    Object.keys(
      (writable?._cache?.map as unknown as Record<string, unknown>) || {}
    ) ||
    [];
  const filesToIndex = writableFiles.filter((path) => {
    const ext = getExtension(path);

    return Boolean(ext) && !SEARCH_EXTENSIONS.ignore.includes(ext);
  });
  const indexedFiles = await Promise.all(
    filesToIndex.map(async (path) => {
      const name = basename(path, extname(path));

      return {
        name,
        path,
        text: SEARCH_EXTENSIONS.index.includes(getExtension(path))
          ? `${name} ${(await readFile(path)).toString()}`
          : name,
      };
    })
  );
  const dynamicIndex = window.lunr?.(function buildIndex() {
    this.ref("path");
    this.field("name");
    this.field("text");
    indexedFiles.forEach((doc) => this.add(doc));
  });

  return window.lunr?.Index.load(dynamicIndex.toJSON());
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
    const updateResults = async (): Promise<void> => {
      if (searchTerm.length > 0) {
        if (!window.lunr) await loadFiles([SEARCH_LIB]);

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
      } else {
        setResults([]);
      }
    };

    updateResults();
  }, [readFile, rootFs, searchTerm]);

  return results;
};
