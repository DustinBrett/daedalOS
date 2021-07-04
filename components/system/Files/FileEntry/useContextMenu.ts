import extensions from "components/system/Files/FileEntry/extensions";
import useFile from "components/system/Files/FileEntry/useFile";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { dirname, extname } from "path";
import { SHORTCUT_EXTENSION } from "utils/constants";

const useContextMenu = (
  url: string,
  pid: string,
  path: string,
  deleteFile: () => void,
  renameFile: () => void
): MenuItem[] => {
  const { open } = useProcesses();
  const { process: [, ...openWith] = [] } = extensions[extname(url)] || {};
  const openWithFiltered = openWith.filter((id) => id !== pid);
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url);
  const menuItems: MenuItem[] = [
    { label: "Delete", action: deleteFile },
    { label: "Rename", action: renameFile },
  ];

  if (pid) {
    const isShortcut =
      extname(path) === SHORTCUT_EXTENSION && url && url !== "/";

    menuItems.unshift({ separator: 1 });

    if (openWithFiltered.length > 0) {
      menuItems.unshift({
        label: "Open with",
        menu: openWithFiltered.map((id): MenuItem => {
          const { icon, title: label } = processDirectory[id] || {};
          const action = () => openFile(id);

          return { icon, label, action };
        }),
      });
    }

    if (isShortcut) {
      menuItems.unshift({
        label: "Open file location",
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

  return menuItems;
};

export default useContextMenu;
