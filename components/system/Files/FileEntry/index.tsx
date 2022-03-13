import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  getModifiedTime,
  getTextWrapData,
} from "components/system/Files/FileEntry/functions";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import FileManager from "components/system/Files/FileManager";
import type { FileStat } from "components/system/Files/FileManager/functions";
import { isSelectionIntersecting } from "components/system/Files/FileManager/Selection/functions";
import type { SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileEntryIconSize } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import useDoubleClick from "hooks/useDoubleClick";
import dynamic from "next/dynamic";
import { basename, dirname, extname, join } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DEFAULT_LOCALE,
  ICON_CACHE,
  ICON_PATH,
  IMAGE_FILE_EXTENSIONS,
  MOUNTABLE_EXTENSIONS,
  NON_BREAKING_HYPHEN,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  USER_ICON_PATH,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import { bufferToUrl, getFormattedSize, isYouTubeUrl } from "utils/functions";
import { spotlightEffect } from "utils/spotlightEffect";

const RenameBox = dynamic(
  () => import("components/system/Files/FileEntry/RenameBox")
);

type FileEntryProps = {
  fileActions: FileActions;
  fileManagerId?: string;
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>;
  focusedEntries: string[];
  focusFunctions: FocusEntryFunctions;
  hideShortcutIcon?: boolean;
  isLoadingFileManager: boolean;
  name: string;
  path: string;
  readOnly?: boolean;
  renaming: boolean;
  selectionRect?: SelectionRect;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  stats: FileStat;
  useNewFolderIcon?: boolean;
  view: FileManagerViewNames;
};

const truncateName = (
  name: string,
  fontSize: string,
  fontFamily: string,
  maxWidth: number
): string => {
  const nonBreakingName = name.replace(/-/g, NON_BREAKING_HYPHEN);
  const { lines } = getTextWrapData(
    nonBreakingName,
    fontSize,
    fontFamily,
    maxWidth
  );

  if (lines.length > 2) {
    const text = !name.includes(" ") ? lines[0] : lines.slice(0, 2).join("");

    return `${text.slice(0, -3)}...`;
  }

  return nonBreakingName;
};

const focusing: string[] = [];

const cacheQueue: (() => Promise<void>)[] = [];

const FileEntry = ({
  fileActions,
  fileManagerId,
  fileManagerRef,
  focusedEntries,
  focusFunctions,
  hideShortcutIcon,
  isLoadingFileManager,
  name,
  path,
  readOnly,
  renaming,
  selectionRect,
  setRenaming,
  stats,
  useNewFolderIcon,
  view,
}: FileEntryProps): JSX.Element => {
  const { blurEntry, focusEntry } = focusFunctions;
  const { url: changeUrl } = useProcesses();
  const [{ comment, getIcon, icon, pid, subIcons, url }, setInfo] = useFileInfo(
    path,
    stats.isDirectory(),
    useNewFolderIcon
  );
  const openFile = useFile(url);
  const {
    createPath,
    exists,
    mkdirRecursive,
    pasteList,
    readFile,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const [showInFileManager, setShowInFileManager] = useState(false);
  const { formats, sizes } = useTheme();
  const listView = view === "list";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const fileName = basename(path);
  const urlExt = extname(url).toLowerCase();
  const isDynamicIcon =
    IMAGE_FILE_EXTENSIONS.has(urlExt) ||
    VIDEO_FILE_EXTENSIONS.has(urlExt) ||
    isYouTubeUrl(url);
  const filteredSubIcons = (
    hideShortcutIcon || stats.systemShortcut
      ? subIcons?.filter((iconEntry) => iconEntry !== SHORTCUT_ICON)
      : subIcons
  )?.filter((subIcon) => subIcon !== icon);
  const isOnlyFocusedEntry =
    focusedEntries.length === 1 && focusedEntries[0] === fileName;
  const extension = extname(path).toLowerCase();
  const isShortcut = extension === SHORTCUT_EXTENSION;
  const directory = isShortcut ? url : path;
  const fileDrop = useFileDrop({
    callback: async (fileDropName, data) => {
      if (!focusedEntries.includes(fileName)) {
        const uniqueName = await createPath(fileDropName, directory, data);

        if (uniqueName) updateFolder(directory, uniqueName);
      }
    },
    directory,
    onDragLeave: () =>
      buttonRef.current?.parentElement?.classList.remove("focus-within"),
    onDragOver: () =>
      buttonRef.current?.parentElement?.classList.add("focus-within"),
  });
  const openInFileExplorer = pid === "FileExplorer";
  const truncatedName = useMemo(
    () =>
      truncateName(
        name,
        sizes.fileEntry.fontSize,
        formats.systemFont,
        sizes.fileEntry[
          listView ? "maxListTextDisplayWidth" : "maxIconTextDisplayWidth"
        ]
      ),
    [formats, listView, name, sizes]
  );
  const iconRef = useRef<HTMLImageElement | null>(null);
  const isIconCached = useRef(false);
  const isDynamicIconLoaded = useRef(false);
  const updateIcon = useCallback(async (): Promise<void> => {
    if (!isLoadingFileManager && !isIconCached.current) {
      if (icon.startsWith("blob:")) {
        isIconCached.current = true;

        const cachedIconPath = join(ICON_CACHE, `${path}.cache`);

        if (
          urlExt !== ".ico" &&
          !url.startsWith(ICON_PATH) &&
          !url.startsWith(USER_ICON_PATH) &&
          !(await exists(cachedIconPath)) &&
          iconRef.current instanceof HTMLImageElement
        ) {
          const cacheIcon = async (): Promise<void> => {
            if (iconRef.current instanceof HTMLImageElement) {
              const htmlToImage = await import("html-to-image");
              const generatedIcon = await htmlToImage.toPng(iconRef.current);

              cacheQueue.push(async () => {
                const baseCachedPath = dirname(cachedIconPath);

                await mkdirRecursive(baseCachedPath);
                await writeFile(
                  cachedIconPath,
                  Buffer.from(
                    generatedIcon.replace("data:image/png;base64,", ""),
                    "base64"
                  ),
                  true
                );

                updateFolder(baseCachedPath, cachedIconPath);

                cacheQueue.shift();
                await cacheQueue[0]?.();
              });

              if (cacheQueue.length === 1) await cacheQueue[0]();
            }
          };

          if (iconRef.current.complete) cacheIcon();
          else iconRef.current.addEventListener("load", cacheIcon);
        }
      } else if (getIcon) {
        const cachedIconPath = join(ICON_CACHE, `${path}.cache`);

        if (await exists(cachedIconPath)) {
          isIconCached.current = true;

          const cachedIconData = await readFile(cachedIconPath);

          setInfo((info) => ({ ...info, icon: bufferToUrl(cachedIconData) }));
        } else if (!isDynamicIconLoaded.current) {
          isDynamicIconLoaded.current = true;
          getIcon();
        }
      }
    }
  }, [
    exists,
    getIcon,
    icon,
    isLoadingFileManager,
    mkdirRecursive,
    path,
    readFile,
    setInfo,
    updateFolder,
    url,
    urlExt,
    writeFile,
  ]);
  const createTooltip = useCallback((): string => {
    if (stats.isDirectory() && !MOUNTABLE_EXTENSIONS.has(extension)) {
      return "";
    }

    if (isShortcut) {
      if (comment) return comment;
      if (url) {
        if (url.startsWith("http:") || url.startsWith("https:")) return url;
        return `Location: ${basename(url, extname(url))} (${dirname(url)})`;
      }
      return "";
    }

    const type =
      extensions[extension as ExtensionType]?.type ||
      `${extension.toUpperCase().replace(".", "")} File`;
    const { size: sizeInBytes } = stats;
    const modifiedTime = getModifiedTime(path, stats);
    const size = getFormattedSize(sizeInBytes);
    const toolTip = `Type: ${type}\nSize: ${size}`;
    const date = new Date(modifiedTime).toISOString().slice(0, 10);
    const time = new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      formats.dateModified
    ).format(modifiedTime);
    const dateModified = `${date} ${time}`;

    return `${toolTip}\nDate modified: ${dateModified}`;
  }, [comment, extension, formats.dateModified, isShortcut, path, stats, url]);
  const [tooltip, setTooltip] = useState("");

  useEffect(() => {
    updateIcon();
  }, [updateIcon]);

  useEffect(() => {
    if (buttonRef.current) {
      const inFocusedEntries = focusedEntries.includes(fileName);
      const inFocusing = focusing.includes(fileName);
      const isFocused = inFocusedEntries || inFocusing;

      if (inFocusedEntries && inFocusing) {
        focusing.splice(focusing.indexOf(fileName), 1);
      }

      if (selectionRect && fileManagerRef.current) {
        const selected = isSelectionIntersecting(
          buttonRef.current.getBoundingClientRect(),
          fileManagerRef.current.getBoundingClientRect(),
          selectionRect,
          fileManagerRef.current.scrollTop
        );

        if (selected && !isFocused) {
          focusing.push(fileName);
          focusEntry(fileName);
          buttonRef.current.focus(PREVENT_SCROLL);
        } else if (!selected && isFocused) {
          blurEntry(fileName);
        }
      } else if (
        isFocused &&
        focusedEntries.length === 1 &&
        !buttonRef.current.contains(document.activeElement)
      ) {
        blurEntry();
        focusEntry(fileName);
        buttonRef.current.focus(PREVENT_SCROLL);
      }
    }
  }, [
    blurEntry,
    fileManagerRef,
    fileName,
    focusEntry,
    focusedEntries,
    selectionRect,
  ]);

  return (
    <>
      <Button
        ref={buttonRef}
        aria-label={name}
        onMouseOver={() => {
          if (!tooltip) setTooltip(createTooltip());
        }}
        title={tooltip}
        {...useDoubleClick(() => {
          if (
            openInFileExplorer &&
            fileManagerId &&
            !MOUNTABLE_EXTENSIONS.has(urlExt)
          ) {
            changeUrl(fileManagerId, url);
            blurEntry();
          } else if (openInFileExplorer && listView) {
            setShowInFileManager((currentState) => !currentState);
          } else {
            openFile(pid, !isDynamicIcon ? icon : undefined);
          }
        }, listView)}
        {...(openInFileExplorer && fileDrop)}
        {...useFileContextMenu(
          url,
          pid,
          path,
          setRenaming,
          fileActions,
          focusFunctions,
          focusedEntries,
          fileManagerId,
          readOnly
        )}
      >
        <figure
          ref={figureRef}
          style={renaming ? { pointerEvents: "all" } : undefined}
          {...(listView && spotlightEffect(figureRef.current))}
        >
          <Icon
            $imgRef={iconRef}
            $moving={pasteList[path] === "move"}
            alt={name}
            src={icon}
            {...FileEntryIconSize[view]}
          />
          {(filteredSubIcons || []).map((entryIcon) => (
            <Icon
              key={entryIcon}
              alt={name}
              src={entryIcon}
              {...FileEntryIconSize[entryIcon !== SHORTCUT_ICON ? "sub" : view]}
            />
          ))}
          {renaming ? (
            <RenameBox
              name={name}
              path={path}
              renameFile={(origPath, newName) => {
                fileActions.renameFile(origPath, newName);
                setRenaming("");
              }}
            />
          ) : (
            <figcaption>
              {!isOnlyFocusedEntry || name.length === truncatedName.length
                ? truncatedName
                : name}
            </figcaption>
          )}
        </figure>
      </Button>
      {showInFileManager && (
        <FileManager
          url={url}
          view="list"
          hideFolders
          hideLoading
          hideShortcutIcons
          readOnly
        />
      )}
    </>
  );
};

export default FileEntry;
