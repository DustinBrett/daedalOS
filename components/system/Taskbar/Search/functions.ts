import { join } from "path";
import { type FSModule } from "browserfs/dist/node/core/FS";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  getCachedIconUrl,
  getInfoWithExtension,
} from "components/system/Files/FileEntry/functions";
import { type FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  TEXT_EDITORS,
  YT_ICON_CACHE,
} from "utils/constants";
import { getExtension, isYouTubeUrl } from "utils/functions";

export type ResultInfo = { icon: string; pid: string; url: string };

export const getResultInfo = async (
  fs: FSModule | undefined,
  url: string,
  signal?: AbortSignal
): Promise<ResultInfo | undefined> => {
  if (!fs) return undefined;

  const {
    icon,
    pid = TEXT_EDITORS[0],
    url: infoUrl,
  } = await new Promise<FileInfo>((resolve) => {
    getInfoWithExtension(fs, url, getExtension(url), (fileInfo) =>
      resolve(fileInfo)
    );
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
    url: infoUrl || url,
  };
};

export const updateInputValueOnReactElement = (
  element: HTMLElement,
  value: string
): void => {
  Object.getOwnPropertyDescriptor(
    // eslint-disable-next-line no-proto
    (
      element as HTMLElement & {
        __proto__: unknown;
      }
    ).__proto__,
    "value"
  )?.set?.call(element, value);

  element.dispatchEvent(new Event("input", { bubbles: true }));
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
          : extensions[extension]?.type ||
            `${extension.toUpperCase().replace(".", "")} File`;
