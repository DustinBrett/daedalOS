import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useCallback } from "react";
import { MENU_SEPERATOR } from "utils/constants";

const useTitlebarContextMenu = (
  id: string,
  hideDisabled = false
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const getItems = useCallback(() => {
    const { allowResizing = true, maximized, minimized } = process || {};
    const disableMaximize = maximized || !allowResizing;

    return [
      !(hideDisabled && (!disableMaximize || minimized)) && {
        action: () => onMaximize(),
        disabled: !disableMaximize,
        icon: `/System/Icons/restore${!disableMaximize ? "_disabled" : ""}.png`,
        label: "Restore",
      },
      {
        action: () => onMinimize(),
        icon: "/System/Icons/minimize.png",
        label: minimized ? "Restore" : "Minimize",
      },
      !(hideDisabled && (disableMaximize || minimized)) && {
        action: () => onMaximize(),
        disabled: disableMaximize,
        icon: `/System/Icons/maximize${disableMaximize ? "_disabled" : ""}.png`,
        label: "Maximize",
      },
      MENU_SEPERATOR,
      {
        action: () => onClose(),
        icon: "/System/Icons/close.png",
        label: "Close",
      },
    ].filter(Boolean) as MenuItem[];
  }, [hideDisabled, onClose, onMaximize, onMinimize, process]);

  return contextMenu?.(getItems);
};

export default useTitlebarContextMenu;
