import { basename, dirname, extname, join } from "path";
import { useTheme } from "styled-components";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { m as motion } from "framer-motion";
import StyledFigure from "components/system/Files/FileEntry/StyledFigure";
import SubIcons from "components/system/Files/FileEntry/SubIcons";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  getCachedIconUrl,
  getModifiedTime,
  getTextWrapData,
} from "components/system/Files/FileEntry/functions";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import FileManager from "components/system/Files/FileManager";
import { isSelectionIntersecting } from "components/system/Files/FileManager/Selection/functions";
import { type SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";
import { type FileStat } from "components/system/Files/FileManager/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { type FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import { type FileActions } from "components/system/Files/FileManager/useFolder";
import {
  type FileManagerViewNames,
  FileEntryIconSize,
} from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import useDoubleClick from "hooks/useDoubleClick";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DEFAULT_LOCALE,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  ICON_PATH,
  IMAGE_FILE_EXTENSIONS,
  LIST_VIEW_ANIMATION,
  MOUNTABLE_EXTENSIONS,
  NON_BREAKING_HYPHEN,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  TRANSITIONS_IN_MILLISECONDS,
  USER_ICON_PATH,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import {
  bufferToUrl,
  getExtension,
  getFormattedSize,
  getHtmlToImage,
  hasFinePointer,
  isCanvasDrawn,
  isYouTubeUrl,
} from "utils/functions";
import { spotlightEffect } from "utils/spotlightEffect";
import { useIsVisible } from "hooks/useIsVisible";
import { UNKNOWN_SIZE } from "contexts/fileSystem/core";

const Down = dynamic(() =>
  import("components/apps/FileExplorer/NavigationIcons").then((mod) => mod.Down)
);

const RenameBox = dynamic(
  () => import("components/system/Files/FileEntry/RenameBox")
);

type FileEntryProps = {
  fileActions: FileActions;
  fileManagerId?: string;
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>;
  focusFunctions: FocusEntryFunctions;
  focusedEntries: string[];
  hasNewFolderIcon?: boolean;
  hideShortcutIcon?: boolean;
  isDesktop?: boolean;
  isHeading?: boolean;
  isLoadingFileManager: boolean;
  loadIconImmediately?: boolean;
  name: string;
  path: string;
  readOnly?: boolean;
  renaming: boolean;
  selectionRect?: SelectionRect;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  stats: FileStat;
  view: FileManagerViewNames;
};

const truncateName = (
  name: string,
  fontSize: string,
  fontFamily: string,
  maxWidth: number,
  alwaysShowPossibleLines = false
): string => {
  const nonBreakingName = name.replace(/-/g, NON_BREAKING_HYPHEN);
  const { lines } = getTextWrapData(
    nonBreakingName,
    fontSize,
    fontFamily,
    maxWidth
  );

  if (lines.length > 2) {
    const text =
      alwaysShowPossibleLines || name.includes(" ")
        ? lines.slice(0, 2).join("")
        : lines[0];

    return `${text.slice(0, -3).trim()}...`;
  }

  return nonBreakingName;
};

const focusing: string[] = [];

const cacheQueue: (() => Promise<void>)[] = [];

const FileEntry: FC<FileEntryProps> = ({
  fileActions,
  fileManagerId,
  fileManagerRef,
  focusedEntries,
  focusFunctions,
  hideShortcutIcon,
  isDesktop,
  isHeading,
  isLoadingFileManager,
  loadIconImmediately,
  name,
  path,
  readOnly,
  renaming,
  selectionRect,
  setRenaming,
  stats,
  hasNewFolderIcon,
  view,
}) => {
  const { blurEntry, focusEntry } = focusFunctions;
  const { url: changeUrl } = useProcesses();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isVisible = useIsVisible(buttonRef, fileManagerRef, isDesktop);
  const [{ comment, getIcon, icon, pid, subIcons, url }, setInfo] = useFileInfo(
    path,
    stats.isDirectory(),
    hasNewFolderIcon,
    isDesktop || isVisible
  );
  const openFile = useFile(url, path);
  const {
    createPath,
    exists,
    fs,
    mkdirRecursive,
    pasteList,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const [showInFileManager, setShowInFileManager] = useState(false);
  const { formats, sizes } = useTheme();
  const listView = view === "list";
  const fileName = basename(path);
  const urlExt = getExtension(url);
  const isYTUrl = useMemo(() => isYouTubeUrl(url), [url]);
  const isDynamicIcon = useMemo(
    () =>
      IMAGE_FILE_EXTENSIONS.has(urlExt) ||
      VIDEO_FILE_EXTENSIONS.has(urlExt) ||
      isYTUrl,
    [isYTUrl, urlExt]
  );
  const isOnlyFocusedEntry =
    focusedEntries.length === 1 && focusedEntries[0] === fileName;
  const extension = useMemo(() => getExtension(path), [path]);
  const isShortcut = useMemo(
    () => extension === SHORTCUT_EXTENSION,
    [extension]
  );
  const directory = isShortcut ? url : path;
  const fileDrop = useFileDrop({
    callback: async (fileDropName, data) => {
      if (!focusedEntries.includes(fileName)) {
        const uniqueName = await createPath(fileDropName, directory, data);

        if (uniqueName) {
          updateFolder(directory, uniqueName);

          return uniqueName;
        }
      }

      return "";
    },
    directory,
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
        ],
        !isDesktop
      ),
    [formats.systemFont, isDesktop, listView, name, sizes.fileEntry]
  );
  const iconRef = useRef<HTMLImageElement | null>(null);
  const isIconCached = useRef(false);
  const isDynamicIconLoaded = useRef(false);
  const getIconAbortController = useRef<AbortController>();
  const createTooltip = useCallback(async (): Promise<string> => {
    if (stats.isDirectory()) return "";

    if (isShortcut) {
      if (comment) return comment;
      if (url) {
        if (url.startsWith("http:") || url.startsWith("https:")) {
          return decodeURIComponent(url);
        }

        const directoryPath = dirname(url);

        return `Location: ${basename(url, extname(url))}${
          !directoryPath || directoryPath === "." ? "" : ` (${dirname(url)})`
        }`;
      }
      return "";
    }

    const type =
      extensions[extension]?.type ||
      `${extension.toUpperCase().replace(".", "")} File`;
    const fullStats = stats.size === UNKNOWN_SIZE ? await stat(path) : stats;
    const { size: sizeInBytes } = fullStats;
    const modifiedTime = getModifiedTime(path, fullStats);
    const size = getFormattedSize(sizeInBytes);
    const toolTip = `Type: ${type}${
      size === "-1 bytes" ? "" : `\nSize: ${size}`
    }`;
    const date = new Date(modifiedTime).toISOString().slice(0, 10);
    const time = new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      formats.dateModified
    ).format(modifiedTime);
    const dateModified = `${date} ${time}`;

    return `${toolTip}\nDate modified: ${dateModified}`;
  }, [
    comment,
    extension,
    formats.dateModified,
    isShortcut,
    path,
    stat,
    stats,
    url,
  ]);
  const [tooltip, setTooltip] = useState<string>();
  const doubleClickHandler = useCallback(() => {
    if (
      openInFileExplorer &&
      fileManagerId &&
      !window.globalKeyStates?.ctrlKey &&
      !MOUNTABLE_EXTENSIONS.has(urlExt)
    ) {
      changeUrl(fileManagerId, url);
      blurEntry();
    } else if (openInFileExplorer && listView) {
      setShowInFileManager((currentState) => !currentState);
    } else {
      openFile(pid, isDynamicIcon ? undefined : icon);
    }
  }, [
    blurEntry,
    changeUrl,
    fileManagerId,
    icon,
    isDynamicIcon,
    listView,
    openFile,
    openInFileExplorer,
    pid,
    url,
    urlExt,
  ]);

  useEffect(() => {
    if (!isLoadingFileManager && isVisible && !isIconCached.current) {
      const updateIcon = async (): Promise<void> => {
        if (icon.startsWith("blob:") || icon.startsWith("data:")) {
          if (icon.startsWith("data:image/jpeg;base64,")) return;

          isIconCached.current = true;

          const cachedIconPath = join(
            ICON_CACHE,
            `${path}${ICON_CACHE_EXTENSION}`
          );

          if (
            urlExt !== ".ico" &&
            !url.startsWith(ICON_PATH) &&
            !url.startsWith(USER_ICON_PATH) &&
            !(await exists(cachedIconPath)) &&
            iconRef.current instanceof HTMLImageElement
          ) {
            const cacheIcon = async (): Promise<void> => {
              if (iconRef.current instanceof HTMLImageElement) {
                const nextQueueItem = (): Promise<void> => {
                  cacheQueue.shift();
                  return cacheQueue[0]?.();
                };
                let generatedIcon = "";

                if (
                  iconRef.current.currentSrc.startsWith(
                    "data:image/gif;base64,"
                  )
                ) {
                  generatedIcon = iconRef.current.currentSrc;
                } else {
                  const { clientHeight, clientWidth } = iconRef.current;
                  const { naturalHeight, naturalWidth } = iconRef.current;
                  const naturalAspectRatio = naturalWidth / naturalHeight;
                  const clientAspectRatio = clientWidth / clientHeight;
                  let height: number | undefined;
                  let width: number | undefined;

                  if (naturalAspectRatio !== clientAspectRatio) {
                    if (naturalWidth > naturalHeight) {
                      height = clientHeight / naturalAspectRatio;
                    } else {
                      width = clientWidth * naturalAspectRatio;
                    }
                  }

                  const htmlToImage = await getHtmlToImage();
                  let iconCanvas: HTMLCanvasElement | undefined;

                  try {
                    iconCanvas = await htmlToImage?.toCanvas(iconRef.current, {
                      height,
                      skipAutoScale: true,
                      style: {
                        objectPosition: height
                          ? "top"
                          : width
                            ? "left"
                            : undefined,
                      },
                      width,
                    });
                  } catch {
                    // Ignore failure to capture
                  }

                  if (iconCanvas && isCanvasDrawn(iconCanvas)) {
                    generatedIcon = iconCanvas.toDataURL("image/png");
                  } else {
                    setTimeout(cacheIcon, TRANSITIONS_IN_MILLISECONDS.WINDOW);
                  }
                }

                if (generatedIcon) {
                  cacheQueue.push(async () => {
                    const baseCachedPath = dirname(cachedIconPath);

                    await mkdirRecursive(baseCachedPath);

                    const cachedIcon = Buffer.from(
                      generatedIcon.replace(/data:.*;base64,/, ""),
                      "base64"
                    );

                    await writeFile(cachedIconPath, cachedIcon, true);
                    setInfo((info) => ({
                      ...info,
                      icon: bufferToUrl(cachedIcon),
                    }));
                    updateFolder(baseCachedPath, basename(cachedIconPath));

                    return nextQueueItem();
                  });
                }

                if (cacheQueue.length === 1) await cacheQueue[0]();
              }
            };

            if (iconRef.current.complete) cacheIcon();
            else {
              iconRef.current.addEventListener(
                "load",
                cacheIcon,
                ONE_TIME_PASSIVE_EVENT
              );
            }
          }
        } else if (!isShortcut || typeof getIcon === "function" || isYTUrl) {
          if (isIconCached.current || !fs) return;

          const cachedIconUrl = await getCachedIconUrl(
            fs,
            join(ICON_CACHE, `${path}${ICON_CACHE_EXTENSION}`)
          );

          if (cachedIconUrl) {
            if (!isIconCached.current) {
              isIconCached.current = true;

              setInfo((info) => ({ ...info, icon: cachedIconUrl }));
            }
          } else if (
            !isDynamicIconLoaded.current &&
            buttonRef.current &&
            typeof getIcon === "function"
          ) {
            getIconAbortController.current = new AbortController();
            await getIcon(getIconAbortController.current.signal);
            isDynamicIconLoaded.current =
              !getIconAbortController.current.signal.aborted;
          }
        }
      };

      updateIcon();
    }

    if (!isVisible && getIconAbortController.current) {
      getIconAbortController.current.abort();
    }
  }, [
    exists,
    fs,
    getIcon,
    icon,
    isLoadingFileManager,
    isShortcut,
    isVisible,
    isYTUrl,
    mkdirRecursive,
    path,
    setInfo,
    updateFolder,
    url,
    urlExt,
    writeFile,
  ]);

  useEffect(
    () => () => {
      try {
        getIconAbortController.current?.abort();
      } catch {
        // Failed to abort getIcon
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (buttonRef.current && fileManagerRef.current) {
      const inFocusedEntries = focusedEntries.includes(fileName);
      const inFocusing = focusing.includes(fileName);
      const isFocused = inFocusedEntries || inFocusing;

      if (inFocusedEntries && inFocusing) {
        focusing.splice(focusing.indexOf(fileName), 1);
      }

      if (selectionRect) {
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
        buttonRef.current !== document.activeElement &&
        !buttonRef.current.contains(document.activeElement)
      ) {
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
        onMouseOver={() => createTooltip().then(setTooltip)}
        title={tooltip}
        {...(listView && { ...LIST_VIEW_ANIMATION, as: motion.button })}
        {...useDoubleClick(doubleClickHandler, listView)}
        {...(openInFileExplorer && fileDrop)}
        {...useFileContextMenu(
          url,
          pid,
          path,
          setRenaming,
          fileActions,
          focusFunctions,
          focusedEntries,
          stats,
          fileManagerId,
          readOnly
        )}
      >
        <StyledFigure
          ref={useCallback(
            (figureRef: HTMLElement) => {
              if (listView && hasFinePointer()) spotlightEffect(figureRef);
            },
            [listView]
          )}
          $renaming={renaming}
        >
          <Icon
            ref={iconRef}
            $eager={loadIconImmediately}
            $moving={pasteList[path] === "move"}
            alt={name}
            src={icon}
            {...FileEntryIconSize[view]}
          />
          <SubIcons
            icon={icon}
            isDesktop={isDesktop}
            name={name}
            showShortcutIcon={Boolean(hideShortcutIcon || stats.systemShortcut)}
            subIcons={subIcons}
            view={view}
          />
          {renaming ? (
            <RenameBox
              isDesktop={isDesktop}
              name={name}
              path={path}
              renameFile={(origPath, newName) => {
                fileActions.renameFile(origPath, newName);
                setRenaming("");
              }}
              setRenaming={setRenaming}
            />
          ) : (
            <figcaption
              {...(isHeading && {
                "aria-level": 1,
                role: "heading",
              })}
            >
              {!isOnlyFocusedEntry || name.length === truncatedName.length
                ? truncatedName
                : name}
            </figcaption>
          )}
          {listView && openInFileExplorer && <Down flip={showInFileManager} />}
        </StyledFigure>
      </Button>
      {showInFileManager && (
        <FileManager
          url={url}
          view="list"
          hideFolders
          hideLoading
          hideShortcutIcons
          loadIconsImmediately
          readOnly
          skipFsWatcher
          skipSorting
        />
      )}
    </>
  );
};

export default FileEntry;
