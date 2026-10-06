import { basename, join } from "path";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import StyledLoading from "components/system/Apps/StyledLoading";
import FileEntry from "components/system/Files/FileEntry";
import Columns from "components/system/Files/FileManager/Columns";
import {
  type Columns as ColumnsObject,
  DEFAULT_COLUMNS,
} from "components/system/Files/FileManager/Columns/constants";
import StyledSelection from "components/system/Files/FileManager/Selection/StyledSelection";
import useSelection from "components/system/Files/FileManager/Selection/useSelection";
import StatusBar from "components/system/Files/FileManager/StatusBar";
import useDraggableEntries from "components/system/Files/FileManager/useDraggableEntries";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useFileKeyboardShortcuts from "components/system/Files/FileManager/useFileKeyboardShortcuts";
import useFocusableEntries from "components/system/Files/FileManager/useFocusableEntries";
import useFolder from "components/system/Files/FileManager/useFolder";
import useFolderContextMenu from "components/system/Files/FileManager/useFolderContextMenu";
import {
  type FileManagerViewNames,
  FileManagerViews,
} from "components/system/Files/Views";
import { useFileSystemActions, useRootFs } from "contexts/fileSystem";
import {
  useForegroundId,
  useSessionActions,
  useView,
  useWindowState,
} from "contexts/session";
import {
  FOCUSABLE_ELEMENT,
  MOUNTABLE_EXTENSIONS,
  PREVENT_SCROLL,
  ROOT_NAME,
  SHORTCUT_EXTENSION,
  START_MENU_PATH,
} from "utils/constants";
import { getExtension, haltEvent } from "utils/functions";
import { loadFileSystemFunctions } from "utils/loaders";

const StyledEmpty = dynamic(
  () => import("components/system/Files/FileManager/StyledEmpty")
);

type FileManagerProps = {
  allowMovingDraggableEntries?: boolean;
  hideFolders?: boolean;
  hideLoading?: boolean;
  hideScrolling?: boolean;
  hideShortcutIcons?: boolean;
  id?: string;
  isDesktop?: boolean;
  isStartMenu?: boolean;
  loadIconsImmediately?: boolean;
  readOnly?: boolean;
  showStatusBar?: boolean;
  skipFsWatcher?: boolean;
  skipSorting?: boolean;
  url: string;
};

const DEFAULT_VIEW = "icon";

const FileManager: FC<FileManagerProps> = ({
  allowMovingDraggableEntries,
  hideFolders,
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  isDesktop,
  isStartMenu,
  loadIconsImmediately,
  readOnly,
  showStatusBar,
  skipFsWatcher,
  skipSorting,
  url,
}) => {
  const { setForegroundId, setViews } = useSessionActions();
  const foregroundId = useForegroundId();
  const sessionView = useView(url);
  const view = isDesktop
    ? "icon"
    : isStartMenu
      ? "list"
      : sessionView || DEFAULT_VIEW;
  const isDetailsView = view === "details";
  const { columns: savedColumns = DEFAULT_COLUMNS } = useWindowState(id || "");
  const [columns, setColumns] = useState<ColumnsObject | undefined>(() =>
    isDetailsView ? savedColumns : undefined
  );
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { blurEntry, focusableEntry, focusedEntries, focusEntry } =
    useFocusableEntries(fileManagerRef);
  const focusFunctions = { blurEntry, focusEntry };
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions, {
      hideFolders,
      hideLoading,
      isDesktop,
      skipFsWatcher,
      skipSorting,
    });
  const { lstat, mountFs } = useFileSystemActions();
  const rootFs = useRootFs();
  const { StyledFileEntry, StyledFileManager } = FileManagerViews[view];
  const { isSelecting, selectionEvents, selectionRect, selectionStyling } =
    useSelection(fileManagerRef, focusedEntries, focusFunctions, isDesktop);
  const draggableEntry = useDraggableEntries(
    url,
    focusedEntries,
    focusFunctions,
    fileManagerRef,
    isSelecting,
    allowMovingDraggableEntries,
    isDesktop
  );
  const fileDrop = useFileDrop({
    callback: folderActions.newPath,
    directory: url,
    updatePositions: allowMovingDraggableEntries,
  });
  const folderContextMenu = useFolderContextMenu(
    url,
    folderActions,
    isDesktop,
    isStartMenu
  );
  const loading = hideLoading ? false : isLoading || url !== currentUrl;
  const setView = (newView: FileManagerViewNames): void => {
    setViews((currentViews) => ({ ...currentViews, [url]: newView }));
    setColumns(newView === "details" ? savedColumns : undefined);
  };
  const keyShortcuts = useFileKeyboardShortcuts(
    files,
    url,
    focusedEntries,
    setRenaming,
    focusFunctions,
    folderActions,
    updateFiles,
    fileManagerRef,
    id,
    isStartMenu,
    isDesktop,
    setView
  );
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const requestingPermissions = useRef(false);
  const focusedOnLoad = useRef(false);
  const onKeyDown = renaming === "" ? keyShortcuts() : undefined;

  useEffect(() => {
    if (
      !requestingPermissions.current &&
      permission !== "granted" &&
      rootFs?.mntMap[currentUrl]?.getName() === "FileSystemAccess"
    ) {
      requestingPermissions.current = true;

      loadFileSystemFunctions().then(({ requestPermission }) =>
        requestPermission(currentUrl)
          .then((permissions) => {
            const isGranted = permissions === "granted";

            if (!permissions || isGranted) {
              setPermission("granted");

              if (isGranted) updateFiles();
            }
          })
          .catch((error: Error) => {
            if (error?.message === "Permission already granted") {
              setPermission("granted");
            }
          })
          .finally(() => {
            requestingPermissions.current = false;
          })
      );
    }
  }, [currentUrl, permission, rootFs?.mntMap, updateFiles]);

  useEffect(() => {
    if (!mounted && MOUNTABLE_EXTENSIONS.has(getExtension(url))) {
      const mountUrl = async (): Promise<void> => {
        if (!(await lstat(url)).isDirectory()) {
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
  }, [lstat, mountFs, mounted, updateFiles, url]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      // eslint-disable-next-line react/set-state-in-effect -- Resets alongside focus state kept in refs, which render can't write
      setCurrentUrl(url);
      setPermission("denied");
      focusedOnLoad.current = false;
    }
  }, [currentUrl, folderActions, url]);

  useEffect(() => {
    if (
      !focusedOnLoad.current &&
      !loading &&
      !isDesktop &&
      !isStartMenu &&
      (!id || foregroundId === id)
    ) {
      fileManagerRef.current?.focus(PREVENT_SCROLL);
      focusedOnLoad.current = true;
    }
  }, [foregroundId, id, isDesktop, isStartMenu, loading]);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Columns resize locally and only reload from saved widths here
    setColumns(isDetailsView ? savedColumns : undefined);
  }, [isDetailsView, savedColumns]);

  // Focusing the desktop must deactivate the foreground window, as no window
  // blur fires when its focused element was already removed by navigation
  const onDesktopFocusCapture = (): void => setForegroundId("");
  const fileKeys = Object.keys(files);
  const isEmptyFolder =
    !isDesktop && !isStartMenu && !loading && fileKeys.length === 0;

  return (
    <>
      {loading && <StyledLoading $hasColumns={isDetailsView} />}
      {!loading && isEmptyFolder && <StyledEmpty $hasColumns={isDetailsView} />}
      <StyledFileManager
        ref={fileManagerRef}
        $isEmptyFolder={isEmptyFolder}
        $scrollable={!hideScrolling}
        aria-busy={loading || undefined}
        aria-label={
          isDesktop
            ? "Desktop"
            : isStartMenu
              ? url === START_MENU_PATH
                ? "All apps"
                : `${basename(url)} folder`
              : basename(url) || ROOT_NAME
        }
        onKeyDownCapture={loading ? undefined : onKeyDown}
        {...(isDesktop && { onFocusCapture: onDesktopFocusCapture })}
        {...(loading || readOnly
          ? { onContextMenu: haltEvent }
          : {
              $selecting: isSelecting,
              ...fileDrop,
              ...folderContextMenu,
              ...selectionEvents,
            })}
        {...FOCUSABLE_ELEMENT}
      >
        {isDetailsView && columns && (
          <Columns
            columns={columns}
            directory={url}
            files={files}
            id={id}
            setColumns={setColumns}
          />
        )}
        {!loading && (
          <>
            {isSelecting && <StyledSelection style={selectionStyling} />}
            {fileKeys.map((file) => (
              <StyledFileEntry
                key={file}
                $desktop={isDesktop}
                $selecting={isSelecting}
                $visible={!isLoading}
                {...(!readOnly && draggableEntry(url, file, renaming === file))}
                {...(renaming === "" && { onKeyDown: keyShortcuts(file) })}
                {...focusableEntry(file)}
              >
                <FileEntry
                  columns={columns}
                  fileActions={fileActions}
                  fileManagerId={id}
                  fileManagerRef={fileManagerRef}
                  focusedEntries={focusedEntries}
                  focusFunctions={focusFunctions}
                  hasNewFolderIcon={isStartMenu}
                  hideShortcutIcon={hideShortcutIcons}
                  isDesktop={isDesktop}
                  isHeading={isDesktop && files[file].systemShortcut}
                  isLoadingFileManager={isLoading}
                  loadIconImmediately={loadIconsImmediately}
                  name={basename(file, SHORTCUT_EXTENSION)}
                  path={join(url, file)}
                  readOnly={readOnly}
                  renaming={renaming === file}
                  selectionRect={selectionRect}
                  setRenaming={setRenaming}
                  stats={files[file]}
                  view={view}
                />
              </StyledFileEntry>
            ))}
          </>
        )}
      </StyledFileManager>
      {showStatusBar && (
        <StatusBar
          count={loading ? 0 : fileKeys.length}
          directory={url}
          fileDrop={fileDrop}
          selected={focusedEntries}
          setView={setView}
          view={view}
        />
      )}
    </>
  );
};

export default FileManager;
