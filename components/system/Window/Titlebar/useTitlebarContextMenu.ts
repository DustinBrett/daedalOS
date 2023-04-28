import {
  CLOSE,
  MAXIMIZE,
  MAXIMIZE_DISABLED,
  MINIMIZE,
  MINIMIZE_DISABLED,
  RESTORE,
  RESTORE_DISABLED,
} from "components/system/Window/Titlebar/Buttons";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useMemo } from "react";
import { MENU_SEPERATOR } from "utils/constants";

const useTitlebarContextMenu = (id: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { allowResizing = true, maximized, minimized } = process || {};

  return useMemo(
    () =>
      contextMenu?.(() => {
        const isMaxOrMin = maximized || minimized;

        return [
          {
            action: minimized ? onMinimize : onMaximize,
            disabled: !isMaxOrMin,
            icon: isMaxOrMin ? RESTORE : RESTORE_DISABLED,
            label: "Restore",
          },
          {
            action: onMinimize,
            disabled: minimized,
            icon: minimized ? MINIMIZE_DISABLED : MINIMIZE,
            label: "Minimize",
          },
          allowResizing && {
            action: onMaximize,
            disabled: isMaxOrMin,
            icon: isMaxOrMin ? MAXIMIZE_DISABLED : MAXIMIZE,
            label: "Maximize",
          },
          MENU_SEPERATOR,
          {
            action: onClose,
            icon: CLOSE,
            label: "Close",
          },
        ].filter(Boolean) as MenuItem[];
      }),
    [
      allowResizing,
      contextMenu,
      maximized,
      minimized,
      onClose,
      onMaximize,
      onMinimize,
    ]
  );
};

export default useTitlebarContextMenu;
