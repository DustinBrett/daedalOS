import { basename, dirname, extname, join } from "path";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  type FileReaders,
  type ObjectReader,
  type ObjectReaders,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import {
  type Files,
  type NewPath,
  COMPLETE_ACTION,
} from "components/system/Files/FileManager/useFolder";
import { type SortBy } from "components/system/Files/FileManager/useSortBy";
import { ONE_TIME_PASSIVE_EVENT, ROOT_SHORTCUT } from "utils/constants";
import { haltEvent } from "utils/functions";

export type FileStat = Stats & {
  systemShortcut?: boolean;
};

type FileStats = [string, FileStat];

type SortFunction = (a: FileStats, b: FileStats) => number;

export const sortByDate =
  (directory: string) =>
  ([aPath, aStats]: FileStats, [bPath, bStats]: FileStats): number =>
    getModifiedTime(join(directory, aPath), aStats) -
    getModifiedTime(join(directory, bPath), bStats);

const sortByName = ([a]: FileStats, [b]: FileStats): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

export const sortBySize = (
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

    if (stat.isDirectory()) folders.push(entry);
    else files.push(entry);
  });

  const sortContent = (fileStats: FileStats[]): FileStats[] => {
    fileStats.sort(sortByName);

    return sortFunction && sortFunction !== sortByName
      ? fileStats.sort(sortFunction)
      : fileStats;
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
    date: sortByDate(directory),
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

export const createFileReaders = async (
  files: DataTransferItemList | FileList | never[],
  directory: string,
  callback: NewPath
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
            Buffer.from(target.result),
            files.length === 1 ? COMPLETE_ACTION.UPDATE_URL : undefined
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
      if (fileSystemEntry?.isDirectory) {
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
        (fileSystemEntry as FileSystemFileEntry)?.file((file) => {
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

type EventData = {
  files: DataTransferItemList | FileList | never[];
  text?: string;
};

export const getEventData = (
  event: DragEvent | InputChangeEvent | never[] | React.DragEvent
): EventData => {
  const dataTransfer =
    (event as React.DragEvent).nativeEvent?.dataTransfer ||
    (event as DragEvent).dataTransfer;
  let files =
    (event as InputChangeEvent).target?.files || dataTransfer?.items || [];
  const text = dataTransfer?.getData("application/json");

  if (Array.isArray(files)) {
    files = [...(files as unknown as DataTransferItemList)].filter(
      (item) => !("kind" in item) || item.kind === "file"
    ) as unknown as DataTransferItemList;
  }

  return { files, text };
};

export const handleFileInputEvent = (
  event: InputChangeEvent | React.DragEvent,
  callback: NewPath,
  directory: string,
  openTransferDialog: (fileReaders: FileReaders | ObjectReaders) => void,
  hasUpdateId = false
): void => {
  haltEvent(event);

  const { files, text } = getEventData(event);

  if (text) {
    try {
      const filePaths = JSON.parse(text) as string[];

      if (!Array.isArray(filePaths) || filePaths.length === 0) return;

      const isSingleFile = filePaths.length === 1;
      const objectReaders = filePaths.map<ObjectReader>((filePath) => {
        let aborted = false;

        return {
          abort: () => {
            aborted = true;
          },
          directory,
          name: filePath,
          operation: "Moving",
          read: async () => {
            if (aborted || dirname(filePath) === ".") return;

            await callback(
              filePath,
              undefined,
              isSingleFile ? COMPLETE_ACTION.UPDATE_URL : undefined
            );
          },
        };
      });

      if (isSingleFile) {
        const [singleFile] = objectReaders;

        if (hasUpdateId) {
          callback(singleFile.name, undefined, COMPLETE_ACTION.UPDATE_URL);
        }
        if (hasUpdateId || singleFile.directory === singleFile.name) return;
      }

      if (filePaths.every((filePath) => dirname(filePath) === directory)) {
        return;
      }

      openTransferDialog(objectReaders);
    } catch {
      // Failed to parse text data to JSON
    }
  } else {
    createFileReaders(files, directory, callback).then(openTransferDialog);
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

export const removeInvalidFilenameCharacters = (name = ""): string =>
  name.replace(/["*/:<>?\\|]/g, "");

export const getParentDirectories = (directory: string): string[] => {
  if (directory === "/") return [];

  const currentParent = dirname(directory);

  return [currentParent, ...getParentDirectories(currentParent)];
};
