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
      action: () => onMaximize(),
      disabled: !maximized,
      icon: `/System/Icons/restore${!maximized ? "_disabled" : ""}.png`,
      label: "Restore",
    },
    {
      action: () => onMinimize(),
      icon: "/System/Icons/minimize.png",
      label: "Minimize",
    },
    {
      action: () => onMaximize(),
      disabled: maximized,
      icon: `/System/Icons/maximize${maximized ? "_disabled" : ""}.png`,
      label: "Maximize",
    },
    MENU_SEPERATOR,
    {
      action: () => onClose(),
      icon: "/System/Icons/close.png",
      label: "Close",
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useTitlebarContextMenu;
