import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import type { FolderActions } from "components/system/Files/FileManager/useFolder";
import { FOLDER_ICON } from "components/system/Files/FileManager/useFolder";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { EMPTY_BUFFER, MENU_SEPERATOR } from "utils/constants";

const NEW_FOLDER = "New folder";
const NEW_TEXT_DOCUMENT = "New Text Document.txt";
const NEW_RTF_DOCUMENT = "New Rich Text Document.whtml";

const richTextDocumentIcon = getIconByFileExtension(".whtml");
const textDocumentIcon = getIconByFileExtension(".txt");

const useFolderContextMenu = (
  url: string,
  { addToFolder, newPath, pasteToFolder, setSortBy }: FolderActions
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { contextMenu } = useMenu();
  const { pasteList = {}, updateFolder } = useFileSystem();
  const menuItems: MenuItem[] = [
    {
      label: "Sort by",
      menu: [
        {
          action: () => setSortBy("name"),
          label: "Name",
        },
        {
          action: () => setSortBy("size"),
          label: "Size",
        },
        {
          action: () => setSortBy("type"),
          label: "Item type",
        },
        {
          action: () => setSortBy("date"),
          label: "Date modified",
        },
      ],
    },
    { action: () => updateFolder(url), label: "Refresh" },
    MENU_SEPERATOR,
    { action: () => addToFolder(), label: "Add file" },
    {
      action: () => pasteToFolder(),
      disabled: Object.keys(pasteList).length === 0,
      label: "Paste",
    },
    MENU_SEPERATOR,
    {
      label: "New",
      menu: [
        {
          action: () => newPath(NEW_FOLDER, undefined, true),
          icon: FOLDER_ICON,
          label: "Folder",
        },
        MENU_SEPERATOR,
        {
          action: () => newPath(NEW_RTF_DOCUMENT, EMPTY_BUFFER, true),
          icon: richTextDocumentIcon,
          label: "Rich Text Document",
        },
        {
          action: () => newPath(NEW_TEXT_DOCUMENT, EMPTY_BUFFER, true),
          icon: textDocumentIcon,
          label: "Text Document",
        },
      ],
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useFolderContextMenu;
