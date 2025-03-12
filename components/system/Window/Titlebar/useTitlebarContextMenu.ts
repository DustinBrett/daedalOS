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
import { useSession } from "contexts/session";
import { MENU_SEPERATOR } from "utils/constants";

const useTitlebarContextMenu = (id: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { setForegroundId } = useSession();
  const focusWindow = useCallback(
    () => setForegroundId(id),
    [id, setForegroundId]
  );
  const {
    allowResizing = true,
    hideMaximizeButton,
    hideMinimizeButton,
    maximized,
    minimized,
    mute,
    muted,
    unmute,
  } = process || {};

  return useMemo(
    () =>
      contextMenu?.(() => {
        const isMaxOrMin = maximized || minimized;
        const showMaxOrMin = !hideMaximizeButton || !hideMinimizeButton;
        const canMute =
          typeof mute === "function" && typeof unmute === "function";

        focusWindow();

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
            action: onMaximize,
            disabled: isMaxOrMin || !allowResizing,
            icon: isMaxOrMin ? MAXIMIZE_DISABLED : MAXIMIZE,
            label: "Maximize",
          },
          showMaxOrMin && MENU_SEPERATOR,
          ...(canMute
            ? [
                {
                  action: () => (muted ? unmute() : mute()),
                  label: muted ? "Unmute" : "Mute",
                },
                MENU_SEPERATOR,
              ]
            : []),
          {
            action: onClose,
            icon: CLOSE,
            label: "Close",
            primary: true,
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
      mute,
      muted,
      onClose,
      onMaximize,
      onMinimize,
      unmute,
    ]
  );
};

export default useTitlebarContextMenu;
