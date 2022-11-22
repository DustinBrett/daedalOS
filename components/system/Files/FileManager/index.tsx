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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FOCUSABLE_ELEMENT,
  MOUNTABLE_EXTENSIONS,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
} from "utils/constants";

const StatusBar = dynamic(
  () => import("components/system/Files/FileManager/StatusBar")
);

const StyledLoading = dynamic(
  () => import("components/system/Files/FileManager/StyledLoading")
);

type FileManagerProps = {
  allowMovingDraggableEntries?: boolean;
  hideFolders?: boolean;
  hideLoading?: boolean;
  hideScrolling?: boolean;
  hideShortcutIcons?: boolean;
  id?: string;
  isDesktop?: boolean;
  loadIconsImmediately?: boolean;
  preloadShortcuts?: boolean;
  readOnly?: boolean;
  showStatusBar?: boolean;
  skipFsWatcher?: boolean;
  skipSorting?: boolean;
  url: string;
  useNewFolderIcon?: boolean;
  view: FileManagerViewNames;
};

const FileManager: FC<FileManagerProps> = ({
  allowMovingDraggableEntries,
  hideFolders,
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  isDesktop,
  loadIconsImmediately,
  preloadShortcuts,
  readOnly,
  showStatusBar,
  skipFsWatcher,
  skipSorting,
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
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions, {
      hideFolders,
      hideLoading,
      preloadShortcuts,
      skipFsWatcher,
      skipSorting,
    });
  const { mountFs, rootFs, stat } = useFileSystem();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef);
  const draggableEntry = useDraggableEntries(
    focusedEntries,
    focusFunctions,
    fileManagerRef,
    isSelecting,
    allowMovingDraggableEntries
  );
  const fileDrop = useFileDrop({
    callback: folderActions.newPath,
    directory: url,
    updatePositions: allowMovingDraggableEntries,
  });
  const folderContextMenu = useFolderContextMenu(url, folderActions, isDesktop);
  const loading = (!hideLoading && isLoading) || url !== currentUrl;
  const keyShortcuts = useFileKeyboardShortcuts(
    files,
    url,
    focusedEntries,
    setRenaming,
    focusFunctions,
    folderActions,
    updateFiles,
    id,
    view
  );
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const requestingPermissions = useRef(false);
  const onKeyDown = useMemo(
    () => (renaming === "" ? keyShortcuts() : undefined),
    [keyShortcuts, renaming]
  );

  useEffect(() => {
    if (
      !requestingPermissions.current &&
      permission !== "granted" &&
      rootFs?.mntMap[url]?.getName() === "FileSystemAccess"
    ) {
      requestingPermissions.current = true;
      requestPermission(currentUrl)
        .then((permissions) => {
          const isGranted = permissions === "granted";

          if (!permissions || isGranted) {
            setPermission("granted");

            if (isGranted) updateFiles();
          }
        })
        .catch((error: Error) => {
          if (error.message === "Permission already granted") {
            setPermission("granted");
          }
        })
        .finally(() => {
          requestingPermissions.current = false;
        });
    }
  }, [currentUrl, permission, rootFs?.mntMap, updateFiles, url]);

  useEffect(() => {
    if (!mounted && MOUNTABLE_EXTENSIONS.has(extname(url).toLowerCase())) {
      const mountUrl = async (): Promise<void> => {
        if (!(await stat(url)).isDirectory()) {
          setMounted((currentlyMounted) => {
            if (!currentlyMounted) {
              mountFs(url)
                .then(() => setTimeout(updateFiles, 100))
                .catch(() => {
                  // Ignore race-condtion failures
                });
            }
            return true;
          });
        }
      };

      mountUrl();
    }
  }, [mountFs, mounted, stat, updateFiles, url]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      setCurrentUrl(url);
      setPermission("denied");
    }
  }, [currentUrl, folderActions, url]);

  useEffect(() => {
    if (!loading) fileManagerRef.current?.focus(PREVENT_SCROLL);
  }, [loading]);

  return (
    <>
      {loading ? (
        <StyledLoading />
      ) : (
        <StyledFileManager
          ref={fileManagerRef}
          $scrollable={!hideScrolling}
          onKeyDown={onKeyDown}
          {...(!readOnly && {
            $selecting: isSelecting,
            ...fileDrop,
            ...folderContextMenu,
            ...selectionEvents,
          })}
          {...FOCUSABLE_ELEMENT}
        >
          {isSelecting && <StyledSelection style={selectionStyling} />}
          {Object.keys(files).map((file) => (
            <StyledFileEntry
              key={file}
              $visible={!isLoading}
              {...(!readOnly && draggableEntry(url, file, renaming === file))}
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
                loadIconImmediately={loadIconsImmediately}
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
