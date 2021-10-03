import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import useFile from "components/system/Files/FileEntry/useFile";
import type { FocusEntryFunctions } from "components/system/Files/FileManager/useFocusableEntries";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { basename, dirname, extname, join } from "path";
import {
  IMAGE_FILE_EXTENSIONS,
  MENU_SEPERATOR,
  MOUNTABLE_EXTENSIONS,
  SHORTCUT_EXTENSION,
} from "utils/constants";

const useFileContextMenu = (
  url: string,
  pid: string,
  path: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  {
    archiveFiles,
    deleteFile,
    downloadFiles,
    extractFiles,
    newShortcut,
  }: FileActions,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  focusedEntries: string[]
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { open } = useProcesses();
  const { setWallpaper } = useSession();
  const urlExtension = extname(url);
  const { process: [extensionProcess, ...openWith] = [] } =
    urlExtension in extensions ? extensions[urlExtension as ExtensionType] : {};
  const openWithFiltered = openWith.filter((id) => id !== pid);
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url);
  const { copyEntries, moveEntries } = useFileSystem();
  const absoluteEntries = (): string[] =>
    focusedEntries.length === 1
      ? [path]
      : [
          ...new Set([
            path,
            ...focusedEntries.map((entry) => join(dirname(path), entry)),
          ]),
        ];
  const menuItems: MenuItem[] = [
    { label: "Cut", action: () => moveEntries(absoluteEntries()) },
    { label: "Copy", action: () => copyEntries(absoluteEntries()) },
    MENU_SEPERATOR,
  ];
  const pathExtension = extname(path);
  const isShortcut = pathExtension === SHORTCUT_EXTENSION;
  const { contextMenu } = useMenu();

  if (!isShortcut) {
    const defaultProcess =
      extensionProcess || getProcessByFileExtension(urlExtension);

    if (defaultProcess || (!pathExtension && !urlExtension)) {
      menuItems.push({
        label: "Create shortcut",
        action: () => newShortcut(path, defaultProcess || "FileExplorer"),
      });
    }
  }

  menuItems.push(
    {
      label: "Delete",
      action: () => absoluteEntries().forEach((entry) => deleteFile(entry)),
    },
    { label: "Rename", action: () => setRenaming(basename(path)) }
  );

  if (!isShortcut && url && (pathExtension || pid !== "FileExplorer")) {
    menuItems.unshift(MENU_SEPERATOR);

    if (MOUNTABLE_EXTENSIONS.has(pathExtension)) {
      menuItems.unshift({
        label: "Extract Here",
        action: () => extractFiles(path),
      });
    }

    menuItems.unshift(
      {
        label: "Add to archive...",
        action: () => archiveFiles(absoluteEntries()),
      },
      {
        label: "Download",
        action: () => downloadFiles(absoluteEntries()),
      }
    );
  }

  if (IMAGE_FILE_EXTENSIONS.has(pathExtension)) {
    menuItems.unshift({
      label: "Set as desktop background",
      menu: [
        {
          label: "Fill",
          action: () => setWallpaper(path, "fill"),
        },
        {
          label: "Fit",
          action: () => setWallpaper(path, "fit"),
        },
        {
          label: "Stretch",
          action: () => setWallpaper(path, "stretch"),
        },
        {
          label: "Tile",
          action: () => setWallpaper(path, "tile"),
        },
        {
          label: "Center",
          action: () => setWallpaper(path, "center"),
        },
      ],
    });
  }

  menuItems.unshift(MENU_SEPERATOR);

  if (!pid && openWithFiltered.length === 0) {
    openWithFiltered.push("MonacoEditor");
  }

  if (openWithFiltered.length > 0) {
    menuItems.unshift({
      label: "Open with",
      menu: openWithFiltered.map((id): MenuItem => {
        const { icon, title: label } = processDirectory[id] || {};
        const action = (): void => openFile(id, icon);

        return { icon, label, action };
      }),
    });
  }

  if (pid) {
    if (isShortcut && url && url !== "/") {
      const isFolder = extname(url) === "";

      menuItems.unshift({
        label: `Open ${isFolder ? "folder" : "file"} location`,
        action: () => open("FileExplorer", dirname(url), ""),
      });
    }

    const openIcon = isShortcut || extname(url) ? pidIcon : undefined;

    menuItems.unshift({
      icon: openIcon,
      label: "Open",
      primary: true,
      action: () => openFile(pid, openIcon),
    });
  }

  return {
    onContextMenuCapture: (event) => {
      blurEntry();
      focusEntry(basename(path));
      contextMenu?.(menuItems)(event);
    },
  };
};

export default useFileContextMenu;
