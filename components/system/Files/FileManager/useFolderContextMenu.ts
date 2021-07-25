import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";

const useFolderContextMenu = (
  { newPath }: FolderActions,
  updateFiles: (appendFile?: string | undefined) => void
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { contextMenu } = useMenu();
  const menuItems: MenuItem[] = [
    { label: "Refresh", action: () => updateFiles() },
    { group: 1 },
    {
      label: "New",
      menu: [
        {
          label: "Folder",
          action: () => newPath("New folder"),
        },
        { group: 2 },
        {
          label: "Text Document",
          action: () => newPath("New Text Document.txt", Buffer.from("")),
        },
      ],
    },
  ];

  return {
    onContextMenuCapture: contextMenu(menuItems),
  };
};

export default useFolderContextMenu;
