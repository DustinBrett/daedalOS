import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { EMPTY_BUFFER, MENU_SEPERATOR } from "utils/constants";

const NEW_FOLDER = "New folder";
const NEW_TEXT_DOCUMENT = "New Text Document.txt";

const useFolderContextMenu = (
  { newPath }: FolderActions,
  updateFiles: (appendFile?: string | undefined) => void,
  setRenaming: React.Dispatch<React.SetStateAction<string>>
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
          action: () => {
            newPath(NEW_FOLDER);
            setRenaming(NEW_FOLDER);
          },
        },
        MENU_SEPERATOR,
        {
          label: "Text Document",
          action: () => {
            newPath(NEW_TEXT_DOCUMENT, EMPTY_BUFFER);
            setRenaming(NEW_TEXT_DOCUMENT);
          },
        },
      ],
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useFolderContextMenu;
