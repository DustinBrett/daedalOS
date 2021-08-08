import RenameBox from "components/system/Files/FileEntry/RenameBox";
import useFile from "components/system/Files/FileEntry/useFile";
import useFileContextMenu from "components/system/Files/FileEntry/useFileContextMenu";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import { isSelectionIntersecting } from "components/system/Files/FileManager/Selection/functions";
import type { SelectionRect } from "components/system/Files/FileManager/Selection/useSelection";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { FileEntryIconSize } from "components/system/Files/Views";
import { useSession } from "contexts/session";
import { basename } from "path";
import { useEffect, useRef } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import useDoubleClick from "utils/useDoubleClick";

type FileEntryProps = {
  fileActions: FileActions;
  name: string;
  path: string;
  renaming: boolean;
  selectionRect?: SelectionRect;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  view: string;
};

const FileEntry = ({
  fileActions,
  name,
  path,
  renaming,
  selectionRect,
  setRenaming,
  view,
}: FileEntryProps): JSX.Element => {
  const { icon, pid, url } = useFileInfo(path);
  const { focusedEntries, blurEntry, focusEntry } = useSession();
  const openFile = useFile(url);
  const singleClick = view === "list";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fileName = basename(path);

  useEffect(() => {
    if (selectionRect && buttonRef.current) {
      const isFocused = focusedEntries.includes(fileName);
      const selected = isSelectionIntersecting(
        buttonRef.current.getBoundingClientRect(),
        selectionRect
      );

      if (selected && !isFocused) {
        focusEntry(fileName);
        buttonRef.current?.focus();
      } else if (!selected && isFocused) {
        blurEntry(fileName);
      }
    }
  }, [blurEntry, fileName, focusEntry, focusedEntries, selectionRect]);

  return (
    <Button
      ref={buttonRef}
      {...useDoubleClick(() => openFile(pid), singleClick)}
      {...useFileContextMenu(url, pid, path, setRenaming, fileActions)}
    >
      <figure>
        <Icon src={icon} alt={name} {...FileEntryIconSize[view]} />
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
          <figcaption>{name}</figcaption>
        )}
      </figure>
    </Button>
  );
};

export default FileEntry;
