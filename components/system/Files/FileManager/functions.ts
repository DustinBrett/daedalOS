import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import type { Files } from "components/system/Files/FileManager/useFolder";
import type { SortBy } from "components/system/Files/FileManager/useSortBy";
import type { FileReaders } from "hooks/useDialog";
import { basename, dirname, extname, join } from "path";
import { ONE_TIME_PASSIVE_EVENT, ROOT_SHORTCUT } from "utils/constants";
import { haltEvent } from "utils/functions";

export type FileStat = Stats & {
  systemShortcut?: boolean;
};

export type FileStats = [string, FileStat];

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
      [
        ...sortOrder.filter((entry) => contentOrder.includes(entry)),
        ...contentOrder.filter((entry) => !sortOrder.includes(entry)),
      ].map((entry) => [entry, contents[entry]])
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

export const handleFileInputEvent = async (
  event: Event | React.DragEvent,
  callback: (fileName: string, buffer?: Buffer) => void,
  directory: string,
  openTransferDialog: (fileReaders: FileReaders) => void
): Promise<void> => {
  haltEvent(event);

  const eventTarget =
    (event as React.DragEvent)?.dataTransfer ??
    ((event.currentTarget as HTMLInputElement) || {});

  if (eventTarget.files.length > 0) {
    const fileReaders: FileReaders = [];
    const addFile = (file: File, subFolder = ""): void => {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        ({ target }) => {
          if (target?.result instanceof ArrayBuffer) {
            callback(
              join(subFolder, file.name),
              Buffer.from(new Uint8Array(target.result))
            );
          }
        },
        ONE_TIME_PASSIVE_EVENT
      );

      fileReaders.push([file, join(directory, subFolder), reader]);
    };

    if (eventTarget.items) {
      const processHandle = async (
        fsHandle: FileSystemHandle,
        subFolder = ""
      ): Promise<void> => {
        if (fsHandle.kind === "directory") {
          const directoryHandle = fsHandle as FileSystemDirectoryHandle;

          for await (const handle of directoryHandle.values()) {
            processHandle(handle, join(subFolder, fsHandle.name));
          }
        } else if (fsHandle.kind === "file") {
          addFile(
            await (fsHandle as FileSystemFileHandle).getFile(),
            subFolder
          );
        }
      };

      await Promise.all(
        [...eventTarget.items].map(async (item) =>
          processHandle(
            (await item.getAsFileSystemHandle()) as FileSystemHandle
          )
        )
      );
    } else {
      [...eventTarget.files].forEach((file) => addFile(file));
    }

    openTransferDialog(fileReaders);
  } else {
    const filePaths = JSON.parse(eventTarget.getData("text")) as string[];

    filePaths.forEach((path) => dirname(path) !== "." && callback(path));
  }
};

export const findPathsRecursive = async (
  paths: string[],
  readdir: (path: string) => Promise<string[]>,
  stat: (path: string, isLstat?: boolean) => Promise<Stats>
): Promise<string[]> => {
  const pathArrays = await Promise.all(
    paths.map(
      async (path): Promise<string[]> =>
        (await stat(path, true)).isDirectory()
          ? findPathsRecursive(
              (await readdir(path)).map((file) => join(path, file)),
              readdir,
              stat
            )
          : [path]
    )
  );

  return pathArrays.flat();
};
