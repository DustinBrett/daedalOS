import RenameBox from "components/system/Files/FileEntry/RenameBox";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import { isSelectionIntersecting } from "components/system/Files/FileManager/Selection/functions";
import type { SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileEntryIconSize } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import type { Stats } from "fs";
import { basename, extname } from "path";
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DEFAULT_LOCALE,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { getFormattedSize } from "utils/functions";
import useDoubleClick from "utils/useDoubleClick";

type FileEntryProps = {
  fileActions: FileActions;
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>;
  focusedEntries: string[];
  focusFunctions: FocusEntryFunctions;
  name: string;
  path: string;
  renaming: boolean;
  selectionRect?: SelectionRect;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  stats: Stats;
  view: FileManagerViewNames;
};

const truncateName = (name: string): string => {
  const maxLength = 15;
  const useFullName = name.length <= maxLength;

  return useFullName ? name : `${name.slice(0, maxLength)}...`;
};

const FileEntry = ({
  fileActions,
  fileManagerRef,
  focusedEntries,
  focusFunctions: { blurEntry, focusEntry },
  name,
  path,
  renaming,
  selectionRect,
  setRenaming,
  stats,
  view,
}: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const openFile = useFile(url);
  const { pasteList } = useFileSystem();
  const { formats } = useTheme();
  const singleClick = view === "list";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fileName = basename(path);
  const isOnlyFocusedEntry =
    focusedEntries.length === 1 && focusedEntries[0] === fileName;

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

  const createTooltip = (): string | undefined => {
    const isShortcut = extname(path) === SHORTCUT_EXTENSION;

    if (isShortcut || stats.isDirectory()) return undefined;

    const { atimeMs, ctimeMs, mtimeMs, size } = stats;
    const unknownTime = atimeMs === ctimeMs && ctimeMs === mtimeMs;
    const formattedSize = getFormattedSize(size);

    if (unknownTime) return `Size: ${formattedSize}`;

    const date = new Date(mtimeMs).toISOString().slice(0, 10);
    const time = new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      formats.dateModified
    ).format(mtimeMs);
    const dateModified = `${date} ${time}`;

    return `Size: ${formattedSize}\nDate modified: ${dateModified}`;
  };

  return (
    <Button
      ref={buttonRef}
      title={createTooltip()}
      {...useDoubleClick(() => openFile(pid), singleClick)}
      {...useFileContextMenu(
        url,
        pid,
        path,
        setRenaming,
        fileActions,
        focusEntry,
        focusedEntries
      )}
    >
      <figure>
        <Icon
          src={icon}
          alt={name}
          moving={pasteList[path] === "move"}
          {...FileEntryIconSize[view]}
        />
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
            {isOnlyFocusedEntry ? name : truncateName(name)}
          </figcaption>
        )}
      </figure>
    </Button>
  );
};

export default FileEntry;
