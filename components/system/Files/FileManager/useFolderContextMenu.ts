import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { EMPTY_BUFFER, MENU_SEPERATOR } from "utils/constants";

const NEW_FOLDER = "New folder";
const NEW_TEXT_DOCUMENT = "New Text Document.txt";
const NEW_RTF_DOCUMENT = "New Rich Text Document.whtml";

const useFolderContextMenu = (
  url: string,
  { addToFolder, newPath, pasteToFolder }: FolderActions
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { contextMenu } = useMenu();
  const { pasteList = {}, updateFolder } = useFileSystem();
  const menuItems: MenuItem[] = [
    { label: "Refresh", action: () => updateFolder(url) },
    MENU_SEPERATOR,
    { label: "Add file", action: () => addToFolder() },
    {
      disabled: Object.keys(pasteList).length === 0,
      label: "Paste",
      action: () => pasteToFolder(),
    },
    MENU_SEPERATOR,
    {
      label: "New",
      menu: [
        {
          label: "Folder",
          action: () => newPath(NEW_FOLDER, undefined, true),
        },
        MENU_SEPERATOR,
        {
          label: "Rich Text Document",
          action: () => newPath(NEW_RTF_DOCUMENT, EMPTY_BUFFER, true),
        },
        {
          label: "Text Document",
          action: () => newPath(NEW_TEXT_DOCUMENT, EMPTY_BUFFER, true),
        },
      ],
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useFolderContextMenu;
