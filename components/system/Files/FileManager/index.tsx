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
  statusBar?: boolean;
  id?: string;
  url: string;
  view: FileManagerViewNames;
};

const FileManager = ({
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  statusBar,
  url,
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

  return (!hideLoading && isLoading) || url !== currentUrl ? (
    <StyledLoading />
  ) : (
    <>
      <StyledFileManager
        ref={fileManagerRef}
        scrollable={!hideScrolling}
        selecting={isSelecting}
        {...selectionEvents}
        {...fileDrop}
        {...folderContextMenu}
      >
        {isSelecting && <StyledSelection style={selectionStyling} />}
        {Object.keys(files).map((file) => (
          <StyledFileEntry
            key={file}
            visible={!isLoading}
            {...(renaming !== file && draggableEntry(url, file))}
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
              renaming={renaming === file}
              selectionRect={selectionRect}
              setRenaming={setRenaming}
              stats={files[file]}
              view={view}
            />
          </StyledFileEntry>
        ))}
      </StyledFileManager>
      {statusBar && (
        <StatusBar
          count={Object.keys(files).length}
          directory={url}
          selected={focusedEntries}
        />
      )}
    </>
  );
};

export default FileManager;
