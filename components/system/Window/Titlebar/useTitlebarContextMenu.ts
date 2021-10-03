import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { MENU_SEPERATOR } from "utils/constants";

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
      icon: `/System/Icons/restore${!maximized ? "_disabled" : ""}.png`,
      action: () => onMaximize(),
    },
    {
      label: "Minimize",
      icon: "/System/Icons/minimize.png",
      action: () => onMinimize(),
    },
    {
      label: "Maximize",
      disabled: maximized,
      icon: `/System/Icons/maximize${maximized ? "_disabled" : ""}.png`,
      action: () => onMaximize(),
    },
    MENU_SEPERATOR,
    {
      label: "Close",
      icon: "/System/Icons/close.png",
      action: () => onClose(),
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useTitlebarContextMenu;
