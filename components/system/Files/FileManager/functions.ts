import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import type {
  CompleteAction,
  Files,
} from "components/system/Files/FileManager/useFolder";
import type { SortBy } from "components/system/Files/FileManager/useSortBy";
import type { FileReaders } from "hooks/useDialog";
import { basename, dirname, extname, join } from "path";
import { ONE_TIME_PASSIVE_EVENT, ROOT_SHORTCUT } from "utils/constants";
import { haltEvent } from "utils/functions";

export type FileStat = Stats & {
  systemShortcut?: boolean;
};

type FileStats = [string, FileStat];

type SortFunction = (a: FileStats, b: FileStats) => number;

const sortByName = ([a]: FileStats, [b]: FileStats): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

const sortBySize = (
  [, { size: aSize }]: FileStats,
  [, { size: bSize }]: FileStats
): number => aSize - bSize;

const sortByType = ([a]: FileStats, [b]: FileStats): number =>
  extname(a).localeCompare(extname(b), "en", { sensitivity: "base" });

const sortSystemShortcuts = (
  [aName, { systemShortcut: aSystem = false }]: FileStats,
  [bName, { systemShortcut: bSystem = false }]: FileStats
): number => {
  if (aSystem === bSystem) {
    if (bSystem && bName === ROOT_SHORTCUT) return 1;

    return aSystem && aName === ROOT_SHORTCUT ? -1 : 0;
  }

  return aSystem ? -1 : 1;
};

export const sortContents = (
  contents: Files,
  sortOrder: string[],
  sortFunction?: SortFunction,
  ascending = true
): Files => {
  if (sortOrder.length > 0) {
    const contentOrder = Object.keys(contents);

    return Object.fromEntries(
      sortOrder
        .filter((entry) => contentOrder.includes(entry))
        // eslint-disable-next-line unicorn/prefer-spread
        .concat(contentOrder.filter((entry) => !sortOrder.includes(entry)))
        .map((entry) => [entry, contents[entry]])
    );
  }

  const files: FileStats[] = [];
  const folders: FileStats[] = [];

  Object.entries(contents).forEach((entry) => {
    const [, stat] = entry;

    if (!stat.isDirectory()) {
      files.push(entry);
    } else {
      folders.push(entry);
    }
  });

  const sortContent = (fileStats: FileStats[]): FileStats[] => {
    const sortedByName = fileStats.sort(sortByName);

    return sortFunction && sortFunction !== sortByName
      ? sortedByName.sort(sortFunction)
      : sortedByName;
  };
  const sortedFolders = sortContent(folders);
  const sortedFiles = sortContent(files);

  if (!ascending) {
    sortedFolders.reverse();
    sortedFiles.reverse();
  }

  return Object.fromEntries(
    (ascending
      ? [...sortedFolders, ...sortedFiles]
      : [...sortedFiles, ...sortedFolders]
    ).sort(sortSystemShortcuts)
  );
};

export const sortFiles = (
  directory: string,
  files: Files,
  sortBy: SortBy,
  ascending: boolean
): Files => {
  const sortFunctionMap: Record<string, SortFunction> = {
    date: ([aPath, aStats]: FileStats, [bPath, bStats]: FileStats): number =>
      getModifiedTime(join(directory, aPath), aStats) -
      getModifiedTime(join(directory, bPath), bStats),
    name: sortByName,
    size: sortBySize,
    type: sortByType,
  };

  return sortBy in sortFunctionMap
    ? sortContents(files, [], sortFunctionMap[sortBy], ascending)
    : files;
};

export const iterateFileName = (name: string, iteration: number): string => {
  const extension = extname(name);
  const fileName = basename(name, extension);

  return `${fileName} (${iteration})${extension}`;
};

const createFileReaders = async (
  files: DataTransferItemList | FileList | never[],
  directory: string,
  callback: (
    fileName: string,
    buffer?: Buffer,
    completeAction?: CompleteAction
  ) => void
): Promise<FileReaders> => {
  const fileReaders: FileReaders = [];
  const addFile = (file: File, subFolder = ""): void => {
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      ({ target }) => {
        if (target?.result instanceof ArrayBuffer) {
          callback(
            join(subFolder, file.name),
            Buffer.from(new Uint8Array(target.result)),
            files.length === 1 ? "updateUrl" : undefined
          );
        }
      },
      ONE_TIME_PASSIVE_EVENT
    );

    fileReaders.push([file, join(directory, subFolder), reader]);
  };
  const addEntry = async (
    fileSystemEntry: FileSystemEntry,
    subFolder = ""
  ): Promise<void> =>
    new Promise((resolve) => {
      if (fileSystemEntry.isDirectory) {
        (fileSystemEntry as FileSystemDirectoryEntry)
          .createReader()
          .readEntries((entries) =>
            Promise.all(
              entries.map((entry) =>
                addEntry(entry, join(subFolder, fileSystemEntry.name))
              )
            ).then(() => resolve())
          );
      } else {
        (fileSystemEntry as FileSystemFileEntry).file((file) => {
          addFile(file, subFolder);
          resolve();
        });
      }
    });

  if (files instanceof FileList) {
    [...files].forEach((file) => addFile(file));
  } else {
    await Promise.all(
      [...files].map(async (file) =>
        addEntry(file.webkitGetAsEntry() as FileSystemEntry)
      )
    );
  }

  return fileReaders;
};

export type InputChangeEvent = Event & { target: HTMLInputElement };

export const handleFileInputEvent = (
  event: InputChangeEvent | React.DragEvent,
  callback: (
    fileName: string,
    buffer?: Buffer,
    completeAction?: CompleteAction
  ) => void,
  directory: string,
  openTransferDialog: (fileReaders: FileReaders) => void
): void => {
  haltEvent(event);

  const files =
    (event as InputChangeEvent).target?.files ||
    (event as React.DragEvent).nativeEvent?.dataTransfer?.items ||
    [];
  const dragText = (event as React.DragEvent).dataTransfer?.getData("text");

  if (!dragText) {
    createFileReaders(files, directory, callback).then(openTransferDialog);
  } else {
    try {
      const filePaths = JSON.parse(dragText || "[]") as string[];

      filePaths?.forEach(
        (path) =>
          dirname(path) !== "." &&
          callback(
            path,
            undefined,
            filePaths.length === 1 ? "updateUrl" : undefined
          )
      );
    } catch {
      // Failed to parse text data to JSON
    }
  }
};

export const findPathsRecursive = async (
  paths: string[],
  readdir: (path: string) => Promise<string[]>,
  lstat: (path: string) => Promise<Stats>
): Promise<string[]> => {
  const pathArrays = await Promise.all(
    paths.map(
      async (path): Promise<string[]> =>
        (await lstat(path)).isDirectory()
          ? findPathsRecursive(
              (await readdir(path)).map((file) => join(path, file)),
              readdir,
              lstat
            )
          : [path]
    )
  );

  return pathArrays.flat();
};
