import FileEntry from "components/system/Files/FileEntry";
import StyledSelection from "components/system/Files/FileManager/Selection/StyledSelection";
import useSelection from "components/system/Files/FileManager/Selection/useSelection";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import useDraggableEntries from "components/system/Files/FileManager/useDraggableEntries";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useFocusableEntries from "components/system/Files/FileManager/useFocusableEntries";
import useFolder from "components/system/Files/FileManager/useFolder";
import useFolderContextMenu from "components/system/Files/FileManager/useFolderContextMenu";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileManagerViews } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { basename, extname, join } from "path";
import { useEffect, useRef, useState } from "react";
import { MOUNTABLE_EXTENSIONS, SHORTCUT_EXTENSION } from "utils/constants";

type FileManagerProps = {
  closing?: boolean;
  hideLoading?: boolean;
  hideScrolling?: boolean;
  hideShortcutIcons?: boolean;
  url: string;
  view: FileManagerViewNames;
};

const FileManager = ({
  closing,
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  url,
  view,
}: FileManagerProps): JSX.Element => {
  const [renaming, setRenaming] = useState("");
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const draggableEntry = useDraggableEntries(focusedEntries, focusFunctions);
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions);
  const { mountFs, unMountFs } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef);
  const fileDrop = useFileDrop({ callback: folderActions.newPath });
  const folderContextMenu = useFolderContextMenu(url, folderActions);
  const fileNames = Object.keys(files);

  useEffect(() => {
    const isMountable = MOUNTABLE_EXTENSIONS.has(extname(url));

    if (isMountable && fileNames.length === 0) {
      mountFs(url).then(() => updateFiles());
    }

    return () => {
      if (isMountable && fileNames.length > 0 && closing) {
        unMountFs(url);
      }
    };
  }, [closing, fileNames, mountFs, unMountFs, updateFiles, url]);

  return !hideLoading && isLoading ? (
    <StyledLoading />
  ) : (
    <StyledFileManager
      ref={fileManagerRef}
      scrollable={!hideScrolling}
      selecting={isSelecting}
      {...selectionEvents}
      {...fileDrop}
      {...folderContextMenu}
    >
      {isSelecting && <StyledSelection style={selectionStyling} />}
      {fileNames.map((file) => (
        <StyledFileEntry
          key={file}
          {...draggableEntry(url, file)}
          {...focusableEntry(file)}
        >
          <FileEntry
            fileActions={fileActions}
            fileManagerRef={fileManagerRef}
            focusFunctions={focusFunctions}
            focusedEntries={focusedEntries}
            hideShortcutIcon={hideShortcutIcons}
            name={basename(file, SHORTCUT_EXTENSION)}
            path={join(url, file)}
            renaming={renaming === file}
            selectionRect={selectionRect}
            setRenaming={setRenaming}
            stats={files[file]}
            view={view}
          />
        </StyledFileEntry>
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
