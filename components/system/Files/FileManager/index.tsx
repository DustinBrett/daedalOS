import FileEntry from "components/system/Files/FileEntry";
import StyledSelection from "components/system/Files/FileManager/Selection/StyledSelection";
import useSelection from "components/system/Files/FileManager/Selection/useSelection";
import StatusBar from "components/system/Files/FileManager/StatusBar";
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
  hideLoading?: boolean;
  hideScrolling?: boolean;
  hideShortcutIcons?: boolean;
  readOnly?: boolean;
  showStatusBar?: boolean;
  id?: string;
  url: string;
  useNewFolderIcon?: boolean;
  view: FileManagerViewNames;
};

const FileManager = ({
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  readOnly,
  showStatusBar,
  url,
  useNewFolderIcon,
  view,
}: FileManagerProps): JSX.Element => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const draggableEntry = useDraggableEntries(focusedEntries, focusFunctions);
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions);
  const { mountFs } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef);
  const fileDrop = useFileDrop({ callback: folderActions.newPath });
  const folderContextMenu = useFolderContextMenu(url, folderActions);
  const loading = (!hideLoading && isLoading) || url !== currentUrl;

  useEffect(() => {
    if (MOUNTABLE_EXTENSIONS.has(extname(url)) && !mounted) {
      setMounted((currentlyMounted) => {
        if (!currentlyMounted) mountFs(url).then(() => updateFiles());
        return true;
      });
    }
  }, [mountFs, mounted, updateFiles, url]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      setCurrentUrl(url);
    }
  }, [currentUrl, folderActions, url]);

  return (
    <>
      {loading ? (
        <StyledLoading />
      ) : (
        <StyledFileManager
          ref={fileManagerRef}
          scrollable={!hideScrolling}
          {...(!readOnly && {
            selecting: isSelecting,
            ...fileDrop,
            ...folderContextMenu,
            ...selectionEvents,
          })}
        >
          {isSelecting && <StyledSelection style={selectionStyling} />}
          {Object.keys(files).map((file) => (
            <StyledFileEntry
              key={file}
              visible={!isLoading}
              {...(renaming !== file && !readOnly && draggableEntry(url, file))}
              {...focusableEntry(file)}
            >
              <FileEntry
                fileActions={fileActions}
                fileManagerId={id}
                fileManagerRef={fileManagerRef}
                focusFunctions={focusFunctions}
                focusedEntries={focusedEntries}
                hideShortcutIcon={hideShortcutIcons}
                isLoadingFileManager={isLoading}
                name={basename(file, SHORTCUT_EXTENSION)}
                path={join(url, file)}
                readOnly={readOnly}
                renaming={renaming === file}
                selectionRect={selectionRect}
                setRenaming={setRenaming}
                stats={files[file]}
                useNewFolderIcon={useNewFolderIcon}
                view={view}
              />
            </StyledFileEntry>
          ))}
        </StyledFileManager>
      )}
      {showStatusBar && (
        <StatusBar
          count={loading ? 0 : Object.keys(files).length}
          directory={url}
          selected={focusedEntries}
        />
      )}
    </>
  );
};

export default FileManager;
