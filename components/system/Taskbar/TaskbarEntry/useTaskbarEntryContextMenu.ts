import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";

const useTaskbarEntryContextMenu = (
  id: string
): {
  onContextMenuCapture: React.MouseEventHandler<HTMLElement>;
} => {
  const { contextMenu } = useMenu();
  const { onClose } = useWindowActions(id);
  const menuItems: MenuItem[] = [
    {
      action: () => onClose(),
      label: "Close",
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useTaskbarEntryContextMenu;
