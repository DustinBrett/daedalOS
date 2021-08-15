import extensions from "components/system/Files/FileEntry/extensions";
import useFile from "components/system/Files/FileEntry/useFile";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { basename, dirname, extname } from "path";
import {
  IMAGE_FILE_EXTENSIONS,
  MENU_SEPERATOR,
  SHORTCUT_EXTENSION,
} from "utils/constants";

const useFileContextMenu = (
  url: string,
  pid: string,
  path: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { deleteFile, downloadFile }: FileActions,
  focusEntry: (entry: string) => void
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { open } = useProcesses();
  const { setWallpaper } = useSession();
  const { process: [, ...openWith] = [] } = extensions[extname(url)] || {};
  const openWithFiltered = openWith.filter((id) => id !== pid);
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url);
  const menuItems: MenuItem[] = [
    { label: "Delete", action: () => deleteFile(path) },
    { label: "Rename", action: () => setRenaming(basename(path)) },
  ];
  const extension = extname(path);
  const isShortcut = extension === SHORTCUT_EXTENSION;
  const { contextMenu } = useMenu();

  if (!isShortcut && url && (extension || pid !== "FileExplorer")) {
    menuItems.unshift(MENU_SEPERATOR);

    menuItems.unshift({
      label: "Download",
      action: () => downloadFile(path),
    });
  }

  if (IMAGE_FILE_EXTENSIONS.has(extension)) {
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

  if (pid) {
    menuItems.unshift(MENU_SEPERATOR);

    if (openWithFiltered.length > 0) {
      menuItems.unshift({
        label: "Open with",
        menu: openWithFiltered.map((id): MenuItem => {
          const { icon, title: label } = processDirectory[id] || {};
          const action = (): void => openFile(id);

          return { icon, label, action };
        }),
      });
    }

    if (isShortcut && url && url !== "/") {
      const isFolder = extname(url) === "";

      menuItems.unshift({
        label: `Open ${isFolder ? "folder" : "file"} location`,
        action: () => open("FileExplorer", dirname(url)),
      });
    }

    menuItems.unshift({
      icon: isShortcut || extname(url) ? pidIcon : undefined,
      label: "Open",
      primary: true,
      action: () => openFile(pid),
    });
  }

  return {
    onContextMenuCapture: (event) => {
      focusEntry(basename(path));
      contextMenu?.(menuItems)(event);
    },
  };
};

export default useFileContextMenu;
