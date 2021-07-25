import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";

const useTitlebarContextMenu = (
  id: string
): {
  onContextMenuCapture: React.MouseEventHandler<HTMLElement>;
} => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { maximized } = process || {};
  const menuItems: MenuItem[] = [
    {
      label: "Restore",
      disabled: !maximized,
      action: () => onMaximize(),
    },
    {
      label: "Minimize",
      action: () => onMinimize(),
    },
    {
      label: "Maximize",
      disabled: maximized,
      action: () => onMaximize(),
    },
    { group: 1 },
    {
      label: "Close",
      action: () => onClose(),
    },
  ];

  return {
    onContextMenuCapture: contextMenu(menuItems),
  };
};

export default useTitlebarContextMenu;
