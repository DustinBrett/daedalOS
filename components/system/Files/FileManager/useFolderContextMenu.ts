import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import type React from "react";
import { EMPTY_BUFFER, MENU_SEPERATOR } from "utils/constants";

const useFolderContextMenu = (
  { newPath }: FolderActions,
  updateFiles: (appendFile?: string | undefined) => void
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { contextMenu } = useMenu();
  const menuItems: MenuItem[] = [
    { label: "Refresh", action: () => updateFiles() },
    MENU_SEPERATOR,
    {
      label: "New",
      menu: [
        {
          label: "Folder",
          action: () => newPath("New folder"),
        },
        MENU_SEPERATOR,
        {
          label: "Text Document",
          action: () => newPath("New Text Document.txt", EMPTY_BUFFER),
        },
      ],
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useFolderContextMenu;
