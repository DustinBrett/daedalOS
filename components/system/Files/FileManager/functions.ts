import { basename, dirname, extname, join } from "path";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  type FileReaders,
  type ObjectReader,
  type ObjectReaders,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import {
  getFileType,
  getModifiedTime,
} from "components/system/Files/FileEntry/functions";
import {
  type Files,
  type NewPath,
  COMPLETE_ACTION,
} from "components/system/Files/FileManager/useFolder";
import { type SortBy } from "components/system/Files/FileManager/useSortBy";
import {
  MILLISECONDS_IN_MINUTE,
  ONE_TIME_PASSIVE_EVENT,
  ROOT_SHORTCUT,
} from "utils/constants";
import { getExtension, haltEvent, toSorted } from "utils/functions";
import { get9pSize } from "contexts/fileSystem/core";

export type FileStat = Stats & {
  systemShortcut?: boolean;
};

type FileStats = [string, FileStat];

type SortFunction = (a: FileStats, b: FileStats) => number;

const sortByName = ([a]: FileStats, [b]: FileStats): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

export const sortByDate =
  (directory: string) =>
  (a: FileStats, b: FileStats): number => {
    const [aPath, aStats] = a;
    const [bPath, bStats] = b;
    const diff =
      getModifiedTime(join(directory, aPath), aStats) -
      getModifiedTime(join(directory, bPath), bStats);

    return Math.abs(diff) < MILLISECONDS_IN_MINUTE ? sortByName(a, b) : diff;
  };

export const sortBySize = (
  [aPath, aStats]: FileStats,
  [bPath, bStats]: FileStats
): number => {
  let aSize = aStats.size;
  let bSize = bStats.size;

  if (aSize === -1) aSize = get9pSize(aPath);
  if (bSize === -1) bSize = get9pSize(bPath);

  return aSize - bSize;
};

const sortByType = (
  [aPath, aStats]: FileStats,
  [bPath, bStats]: FileStats
): number => {
  const aExt = aStats.isDirectory() ? "" : getExtension(aPath);
  const bExt = bStats.isDirectory() ? "" : getExtension(bPath);
  const aType = aExt ? getFileType(aExt) : "";
  const bType = bExt ? getFileType(bExt) : "";

  return aType.localeCompare(bType, "en", { sensitivity: "base" });
};

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
    const newFileStats = toSorted(fileStats, sortByName);

    return sortFunction && sortFunction !== sortByName
      ? toSorted(newFileStats, sortFunction)
      : newFileStats;
  };
  const sortedFolders = sortContent(folders);
  const sortedFiles = sortContent(files);

  if (!ascending) {
    sortedFolders.reverse();
    sortedFiles.reverse();
  }

  return Object.fromEntries(
    (ascending || sortFunction === sortByType
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
  const hasSingleFile = files.length === 1;
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
            hasSingleFile ? COMPLETE_ACTION.UPDATE_URL : undefined
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
  openTransferDialog: (
    fileReaders: FileReaders | ObjectReaders
  ) => Promise<void>,
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

      if (
        filePaths.every((filePath) => dirname(filePath) === directory) ||
        filePaths.includes(directory)
      ) {
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
