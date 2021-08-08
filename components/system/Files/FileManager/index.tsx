import FileEntry from "components/system/Files/FileEntry";
import StyledSelection from "components/system/Files/FileManager/Selection/StyledSelection";
import useSelection from "components/system/Files/FileManager/Selection/useSelection";
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
  url: string;
  view: FileManagerViewNames;
};

const FileManager = ({ url, view }: FileManagerProps): JSX.Element => {
  const { fileActions, files, folderActions, updateFiles } = useFolder(url);
  const { mountFs, unMountFs } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const [renaming, setRenaming] = useState("");
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const draggableEntry = useDraggableEntries(updateFiles);
  const focusableEntry = useFocusableEntries(fileManagerRef);
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef);

  useEffect(() => {
    const isMountable = MOUNTABLE_EXTENSIONS.has(extname(url));

    if (isMountable && files.length === 0) mountFs(url, updateFiles);

    return () => {
      if (isMountable && files.length > 0) unMountFs(url);
    };
  }, [files, mountFs, unMountFs, updateFiles, url]);

  return (
    <StyledFileManager
      ref={fileManagerRef}
      selecting={isSelecting}
      {...selectionEvents}
      {...useFileDrop(folderActions.newPath)}
      {...useFolderContextMenu(folderActions, updateFiles, setRenaming)}
    >
      {isSelecting && <StyledSelection style={selectionStyling} />}
      {files.map((file) => (
        <StyledFileEntry
          key={file}
          {...draggableEntry(url, file)}
          {...focusableEntry(file)}
        >
          <FileEntry
            fileActions={fileActions}
            fileManagerRef={fileManagerRef}
            name={basename(file, SHORTCUT_EXTENSION)}
            path={join(url, file)}
            renaming={renaming === file}
            selectionRect={selectionRect}
            setRenaming={setRenaming}
            view={view}
          />
        </StyledFileEntry>
      ))}
    </StyledFileManager>
  );
};

export default FileManager;
