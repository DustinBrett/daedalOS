import { useCallback, useMemo } from "react";
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
import {
  type ContextMenuCapture,
  type MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { MENU_SEPERATOR, PREVENT_SCROLL } from "utils/constants";
import { useSession } from "contexts/session";

const useTitlebarContextMenu = (id: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { setForegroundId } = useSession();
  const {
    allowResizing = true,
    componentWindow,
    hideMaximizeButton,
    hideMinimizeButton,
    maximized,
    minimized,
  } = process || {};
  const focusWindow = useCallback((): void => {
    setForegroundId(id);
    componentWindow?.focus(PREVENT_SCROLL);
  }, [componentWindow, id, setForegroundId]);

  return useMemo(
    () =>
      contextMenu?.(() => {
        const isMaxOrMin = maximized || minimized;
        const showMaxOrMin = !hideMaximizeButton || !hideMinimizeButton;

        return [
          showMaxOrMin && {
            action: () => {
              if (minimized) onMinimize();
              else onMaximize();

              focusWindow();
            },
            disabled: !isMaxOrMin,
            icon: isMaxOrMin ? RESTORE : RESTORE_DISABLED,
            label: "Restore",
          },
          !hideMinimizeButton && {
            action: onMinimize,
            disabled: minimized,
            icon: minimized ? MINIMIZE_DISABLED : MINIMIZE,
            label: "Minimize",
          },
          !hideMaximizeButton && {
            action: () => {
              onMaximize();
              focusWindow();
            },
            disabled: isMaxOrMin || !allowResizing,
            icon: isMaxOrMin ? MAXIMIZE_DISABLED : MAXIMIZE,
            label: "Maximize",
          },
          showMaxOrMin && MENU_SEPERATOR,
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
      focusWindow,
      hideMaximizeButton,
      hideMinimizeButton,
      maximized,
      minimized,
      onClose,
      onMaximize,
      onMinimize,
    ]
  );
};

export default useTitlebarContextMenu;
