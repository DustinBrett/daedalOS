import FileEntry from "components/system/Files/FileEntry";
import StyledSelection from "components/system/Files/FileManager/Selection/StyledSelection";
import useSelection from "components/system/Files/FileManager/Selection/useSelection";
import useDraggableEntries from "components/system/Files/FileManager/useDraggableEntries";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useFileKeyboardShortcuts from "components/system/Files/FileManager/useFileKeyboardShortcuts";
import useFocusableEntries from "components/system/Files/FileManager/useFocusableEntries";
import useFolder from "components/system/Files/FileManager/useFolder";
import useFolderContextMenu from "components/system/Files/FileManager/useFolderContextMenu";
import type { FileManagerViewNames } from "components/system/Files/Views";
import { FileManagerViews } from "components/system/Files/Views";
import { useFileSystem } from "contexts/fileSystem";
import { requestPermission } from "contexts/fileSystem/functions";
import dynamic from "next/dynamic";
import { basename, extname, join } from "path";
import { useEffect, useRef, useState } from "react";
import {
  FOCUSABLE_ELEMENT,
  MOUNTABLE_EXTENSIONS,
  SHORTCUT_EXTENSION,
} from "utils/constants";

const StatusBar = dynamic(
  () => import("components/system/Files/FileManager/StatusBar")
);

const StyledLoading = dynamic(
  () => import("components/system/Files/FileManager/StyledLoading")
);

type FileManagerProps = {
  hideFolders?: boolean;
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

const FileManager: FC<FileManagerProps> = ({
  hideFolders,
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  readOnly,
  showStatusBar,
  url,
  useNewFolderIcon,
  view,
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const draggableEntry = useDraggableEntries(
    focusedEntries,
    focusFunctions,
    fileManagerRef
  );
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions, hideFolders, hideLoading);
  const { mountFs, rootFs } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef);
  const fileDrop = useFileDrop({
    callback: folderActions.newPath,
    directory: url,
  });
  const folderContextMenu = useFolderContextMenu(url, folderActions);
  const loading = (!hideLoading && isLoading) || url !== currentUrl;
  const keyShortcuts = useFileKeyboardShortcuts(
    files,
    url,
    focusedEntries,
    setRenaming,
    focusFunctions,
    folderActions,
    updateFiles,
    id
  );
  const [permission, setPermission] = useState<PermissionState>("prompt");

  useEffect(() => {
    if (
      permission !== "granted" &&
      rootFs?.mntMap[url]?.getName() === "FileSystemAccess"
    ) {
      requestPermission(currentUrl).then((permissions) => {
        const isGranted = permissions === "granted";

        if (!permissions || isGranted) {
          setPermission("granted");

          if (isGranted) updateFiles();
        }
      });
    }
  }, [currentUrl, permission, rootFs?.mntMap, updateFiles, url]);

  useEffect(() => {
    if (MOUNTABLE_EXTENSIONS.has(extname(url).toLowerCase()) && !mounted) {
      setMounted((currentlyMounted) => {
        if (!currentlyMounted) {
          mountFs(url).then(() => setTimeout(updateFiles, 100));
        }
        return true;
      });
    }
  }, [mountFs, mounted, updateFiles, url]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      setCurrentUrl(url);
      setPermission("denied");
    }
  }, [currentUrl, folderActions, url]);

  return (
    <>
      {loading ? (
        <StyledLoading />
      ) : (
        <StyledFileManager
          ref={fileManagerRef}
          $scrollable={!hideScrolling}
          {...(!readOnly && {
            $selecting: isSelecting,
            ...fileDrop,
            ...folderContextMenu,
            ...selectionEvents,
          })}
          {...(renaming === "" && { onKeyDown: keyShortcuts() })}
          {...FOCUSABLE_ELEMENT}
        >
          {isSelecting && <StyledSelection style={selectionStyling} />}
          {Object.keys(files).map((file) => (
            <StyledFileEntry
              key={file}
              $visible={!isLoading}
              {...(renaming !== file && !readOnly && draggableEntry(url, file))}
              {...(renaming === "" && { onKeyDown: keyShortcuts(file) })}
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
