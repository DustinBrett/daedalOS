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
import { useMenuActions } from "contexts/menu";
import {
  type ContextMenuCapture,
  type MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcess } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { MENU_SEPERATOR, SYSTEM_MENU } from "utils/constants";
import { isKeyboardNavigating } from "utils/keyboard";

const useTitlebarContextMenu = (id: string): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const { setForegroundId } = useSessionActions();
  const focusWindow = (): void => setForegroundId(id);
  const {
    allowResizing = true,
    hideMaximizeButton,
    hideMinimizeButton,
    maximized,
    minimized,
    mute,
    muted,
    unmute,
  } = useProcess(id);

  return contextMenu(() => {
    const isMaxOrMin = maximized || minimized;
    const showMaxOrMin = !hideMaximizeButton || !hideMinimizeButton;
    const canMute = typeof mute === "function" && typeof unmute === "function";

    // Like Windows, a menu from the keyboard leaves focus where it opened from
    if (!isKeyboardNavigating()) focusWindow();

    return [
      showMaxOrMin && {
        action: () => {
          if (minimized) onMinimize(true);
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
  }, SYSTEM_MENU);
};

export default useTitlebarContextMenu;
