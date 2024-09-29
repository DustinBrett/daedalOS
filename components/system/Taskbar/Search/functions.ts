import { join } from "path";
import { type FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  getCachedIconUrl,
  getFileType,
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "components/system/Files/FileEntry/functions";
import { type FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import {
  FOLDER_FRONT_ICON,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  TEXT_EDITORS,
  YT_ICON_CACHE,
} from "utils/constants";
import { getExtension, isYouTubeUrl } from "utils/functions";
import { type RootFileSystem } from "contexts/fileSystem/useAsyncFs";

export type ResultInfo = {
  icon: string;
  pid: string;
  subIcons: string[];
  url: string;
};

export const getResultInfo = async (
  fs: FSModule | undefined,
  url: string,
  signal?: AbortSignal
): Promise<ResultInfo | undefined> => {
  if (!fs) return undefined;

  const {
    subIcons,
    icon,
    pid = TEXT_EDITORS[0],
    url: infoUrl,
  } = await new Promise<FileInfo>((resolve) => {
    fs.lstat(url, (err, stats) => {
      const isDirectory = !err && stats ? stats.isDirectory() : false;
      const extension = getExtension(url);

      if (extension && !isDirectory) {
        getInfoWithExtension(fs, url, extension, (fileInfo) =>
          resolve(fileInfo)
        );
      } else {
        getInfoWithoutExtension(
          fs,
          fs.getRootFS() as RootFileSystem,
          url,
          isDirectory,
          false,
          (fileInfo) => resolve(fileInfo),
          false
        );
      }
    });
  });

  if (signal?.aborted) return undefined;

  const isYT = isYouTubeUrl(infoUrl);
  const cachedIcon = await getCachedIconUrl(
    fs,
    join(
      isYT ? YT_ICON_CACHE : ICON_CACHE,
      `${
        isYT ? new URL(infoUrl).pathname.replace("/", "") : infoUrl
      }${ICON_CACHE_EXTENSION}`
    )
  );

  return {
    icon: cachedIcon || icon,
    pid,
    subIcons: subIcons?.includes(FOLDER_FRONT_ICON) ? subIcons : [],
    url: infoUrl || url,
  };
};

export const updateInputValueOnReactElement = (
  element: HTMLInputElement,
  value: string
): void => {
  const wasEmpty = element.value.length === 0;
  const updateInputValue = (): void => {
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      "value"
    )?.set?.call(element, value);

    element.dispatchEvent(new Event("input", { bubbles: true }));
  };

  updateInputValue();
  requestAnimationFrame(
    () =>
      wasEmpty &&
      value.length === 1 &&
      element.value.length === 2 &&
      // Reset the value if it got doubled
      updateInputValue()
  );
};

export const fileType = (
  stats: Stats | undefined,
  extension: string,
  isYTUrl: boolean,
  isAppShortcut: boolean,
  isNostrUrl: boolean
): string =>
  isNostrUrl
    ? "Nostr URI"
    : isAppShortcut
      ? "App"
      : isYTUrl
        ? "YouTube Video"
        : stats?.isDirectory() || !extension
          ? "File folder"
          : getFileType(extension);
