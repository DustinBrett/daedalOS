import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import {
  get9pModifiedTime,
  getTextWrapData,
} from "components/system/Files/FileEntry/functions";
import RenameBox from "components/system/Files/FileEntry/RenameBox";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
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
import { basename, dirname, extname } from "path";
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DEFAULT_LOCALE,
  IMAGE_FILE_EXTENSIONS,
  MOUNTABLE_EXTENSIONS,
  NON_BREAKING_HYPHEN,
  NON_BREAKING_SPACE,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import { getFormattedSize } from "utils/functions";
import useDoubleClick from "utils/useDoubleClick";

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

    return `${text.replace(/ /g, NON_BREAKING_SPACE).slice(0, -3)}...`;
  }

  return nonBreakingName;
};

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
  view,
}: FileEntryProps): JSX.Element => {
  const { blurEntry, focusEntry } = focusFunctions;
  const { url: changeUrl } = useProcesses();
  const { comment, getIcon, icon, pid, subIcons, url } = useFileInfo(
    path,
    stats.isDirectory()
  );
  const openFile = useFile(url);
  const { createPath, pasteList, updateFolder } = useFileSystem();
  const { formats, sizes } = useTheme();
  const singleClick = view === "list";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fileName = basename(path);
  const urlExt = extname(url);
  const isDynamicIcon =
    IMAGE_FILE_EXTENSIONS.has(urlExt) || VIDEO_FILE_EXTENSIONS.has(urlExt);
  const filteredSubIcons =
    hideShortcutIcon || stats.systemShortcut
      ? subIcons?.filter((iconEntry) => iconEntry !== SHORTCUT_ICON)
      : subIcons;
  const isOnlyFocusedEntry =
    focusedEntries.length === 1 && focusedEntries[0] === fileName;
  const extension = extname(path);
  const isShortcut = extension === SHORTCUT_EXTENSION;
  const fileDrop = useFileDrop({
    callback: async (fileDropName, data) => {
      const directory = isShortcut ? url : path;
      const uniqueName = await createPath(fileDropName, directory, data);

      if (uniqueName) updateFolder(directory, uniqueName);
    },
  });

  useEffect(() => {
    if (buttonRef.current) {
      const isFocused = focusedEntries.includes(fileName);

      if (selectionRect && fileManagerRef.current) {
        const selected = isSelectionIntersecting(
          buttonRef.current.getBoundingClientRect(),
          fileManagerRef.current.getBoundingClientRect(),
          selectionRect
        );

        if (selected && !isFocused) {
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

  useEffect(() => {
    if (!isLoadingFileManager && getIcon && !icon.startsWith("blob:")) {
      getIcon();
    }
  }, [getIcon, icon, isLoadingFileManager]);

  const createTooltip = (): string | undefined => {
    if (stats.isDirectory() && !MOUNTABLE_EXTENSIONS.has(extension)) {
      return undefined;
    }

    if (isShortcut) {
      if (comment) return comment;
      if (url) {
        return `Location: ${basename(url, extname(url))} (${dirname(url)})`;
      }
      return "";
    }

    const type =
      extensions[extension as ExtensionType]?.type ||
      `${extension.toUpperCase().replace(".", "")} File`;
    const { atimeMs, ctimeMs, mtimeMs, size: sizeInBytes } = stats;
    const unknownTime = atimeMs === ctimeMs && ctimeMs === mtimeMs;
    const modifiedTime = unknownTime ? get9pModifiedTime(path) : mtimeMs;
    const size = getFormattedSize(sizeInBytes);
    const toolTip = `Type: ${type}\nSize: ${size}`;
    const date = new Date(modifiedTime).toISOString().slice(0, 10);
    const time = new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      formats.dateModified
    ).format(modifiedTime);
    const dateModified = `${date} ${time}`;

    return `${toolTip}\nDate modified: ${dateModified}`;
  };

  return (
    <Button
      ref={buttonRef}
      title={createTooltip()}
      {...useDoubleClick(() => {
        if (
          pid === "FileExplorer" &&
          fileManagerId &&
          !MOUNTABLE_EXTENSIONS.has(urlExt)
        ) {
          changeUrl(fileManagerId, url);
          blurEntry();
        } else {
          openFile(pid, !isDynamicIcon ? icon : undefined);
        }
      }, singleClick)}
      {...(pid === "FileExplorer" && fileDrop)}
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
      <figure>
        {[icon, ...(filteredSubIcons || [])].map((entryIcon) => (
          <Icon
            key={entryIcon}
            alt={name}
            moving={icon === entryIcon && pasteList[path] === "move"}
            src={entryIcon}
            {...FileEntryIconSize[
              entryIcon !== icon && entryIcon !== SHORTCUT_ICON ? "sub" : view
            ]}
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
            {isOnlyFocusedEntry
              ? name
              : truncateName(
                  name,
                  sizes.fileEntry.fontSize,
                  formats.systemFont,
                  sizes.fileEntry.maxTextDisplayWidth
                )}
          </figcaption>
        )}
      </figure>
    </Button>
  );
};

export default FileEntry;
