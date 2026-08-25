import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { type Index } from "lunr";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import { type FileSystem } from "browserfs/dist/node/core/file_system";
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
let lunrLoadPromise: Promise<void> | undefined;

const getLunr = async (): Promise<typeof window.lunr> => {
  if (!window.lunr) {
    if (!lunrLoadPromise) {
      lunrLoadPromise = loadFiles([SEARCH_LIB]).catch((error) => {
        lunrLoadPromise = undefined;
        throw error;
      });
    }
    await lunrLoadPromise;
  }
  return window.lunr;
};

type ResponseIndex = Index & {
  paths: string[];
};

const search = async (
  searchTerm: string,
  index?: Index
): Promise<Index.Result[]> => {
  if (!index && !baseIndex?.search) {
    const [response, lunr] = await Promise.all([
      fetch(FILE_INDEX, HIGH_PRIORITY_REQUEST),
      getLunr(),
    ]);

    try {
      const { paths, ...responseIndex } = JSON.parse(
        await response.text()
      ) as ResponseIndex;

      baseIndex = lunr?.Index.load(responseIndex);
      basePaths = paths;
    } catch {
      // Failed to parse text data to JSON
    }
  }

  const searchIndex = index ?? baseIndex;
  const normalizedSearchTerm = searchTerm
    .trim()
    .replace(/\./g, " ")
    .replace(/\*~\^-\+/g, "");
  const merged = new Map<string | number, Index.Result>();

  if (normalizedSearchTerm) {
    try {
      const exactResults = searchIndex.search?.(normalizedSearchTerm) ?? [];
      const wildcardResults =
        searchIndex.search?.(
          `${normalizedSearchTerm.split(" ").join("* ")}*`
        ) ?? [];

      for (const result of [...exactResults, ...wildcardResults]) {
        const existing = merged.get(result.ref);

        if (!existing || existing.score < result.score) {
          merged.set(result.ref, result);
        }
      }
    } catch {
      // Ignore search errors
    }
  }

  if (merged.size === 0) return [];

  return [...merged.values()].map((result) => ({
    ...result,
    ref:
      (Object.prototype.hasOwnProperty.call(basePaths, result.ref)
        ? (basePaths[result.ref as keyof typeof basePaths] as string)
        : result.ref) || "",
  }));
};

const sortByScore = (a: Index.Result, b: Index.Result): number =>
  b.score - a.score;

const mergeWithDynamicFirst = (
  baseResult: Index.Result[],
  dynamicResult: Index.Result[]
): Index.Result[] => {
  const dynamicRefs = new Set(dynamicResult.map(({ ref }) => ref));

  return [
    ...[...dynamicResult].sort(sortByScore),
    ...baseResult.filter(({ ref }) => !dynamicRefs.has(ref)).sort(sortByScore),
  ];
};

const walkWritable = (fileSystem: FileSystem, dir: string): Promise<string[]> =>
  new Promise((resolve) => {
    fileSystem.readdir(dir, async (readErr, entries = []) => {
      if (readErr) {
        resolve([]);
        return;
      }

      const results = await Promise.all(
        entries.map(
          (entry) =>
            // eslint-disable-next-line promise/param-names
            new Promise<string[]>((resolveEntry) => {
              const fullPath = dir === "/" ? `/${entry}` : `${dir}/${entry}`;

              fileSystem.stat(fullPath, false, async (statErr, stats) =>
                resolveEntry(
                  statErr || !stats
                    ? []
                    : stats.isDirectory()
                      ? await walkWritable(fileSystem, fullPath)
                      : [fullPath]
                )
              );
            })
        )
      );

      resolve(results.flat());
    });
  });

const buildDynamicIndex = async (
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index> => {
  const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
  const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
  const writable = overlayedFileSystems?.writable;

  const writableFiles = writable ? await walkWritable(writable, "/") : [];
  const filesToIndex = writableFiles.filter((path) => {
    const ext = getExtension(path);

    return Boolean(ext) && !SEARCH_EXTENSIONS.ignore.includes(ext);
  });
  const [indexedFiles, lunr] = await Promise.all([
    Promise.all(
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
    ),
    getLunr(),
  ]);
  const dynamicIndex = lunr?.(function buildIndex() {
    this.ref("path");
    this.field("name");
    this.field("text");
    indexedFiles.forEach((doc) => this.add(doc));
  });

  return lunr?.Index.load(dynamicIndex.toJSON());
};

export const fullSearch = async (
  searchTerm: string,
  readFile: (path: string) => Promise<Buffer>,
  rootFs?: RootFileSystem
): Promise<Index.Result[]> => {
  const [baseResult, dynamicIndex] = await Promise.all([
    search(searchTerm),
    buildDynamicIndex(readFile, rootFs),
  ]);
  const dynamicResult = await search(searchTerm, dynamicIndex);

  return mergeWithDynamicFirst(baseResult, dynamicResult);
};

export const useSearch = (searchTerm: string): Index.Result[] => {
  const [results, setResults] = useState([] as Index.Result[]);
  const { readFile, rootFs } = useFileSystem();

  useEffect(() => {
    const updateResults = async (): Promise<void> => {
      if (searchTerm.length > 0) {
        setResults([...(await search(searchTerm))].sort(sortByScore));
        buildDynamicIndex(readFile, rootFs).then((dynamicIndex) =>
          search(searchTerm, dynamicIndex).then((searchResults) =>
            setResults((currentResults) =>
              mergeWithDynamicFirst(currentResults, searchResults)
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
