import { useMemo } from "react";
import useFullscreen from "components/apps/Photos/useFullscreen";
import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useProcessesRef } from "hooks/useProcessesRef";
import { MENU_SEPERATOR } from "utils/constants";
import { toggleShowDesktop } from "utils/functions";

const useTaskbarContextMenu = (onStartButton = false): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { minimize, open } = useProcesses();
  const processesRef = useProcessesRef();
  const { fullscreen, toggleFullscreen } = useFullscreen();

  return useMemo(
    () =>
      contextMenu?.(() => {
        const processArray = Object.entries(processesRef.current);
        const allWindowsMinimized =
          processArray.length > 0 &&
          !processArray.some(([, { minimized }]) => !minimized);
        const toggleLabel = allWindowsMinimized
          ? "Show open windows"
          : "Show the desktop";
        const menuItems: MenuItem[] = [
          {
            action: () => toggleShowDesktop(processesRef.current, minimize),
            label: onStartButton ? "Desktop" : toggleLabel,
          },
        ];

        if (onStartButton) {
          menuItems.unshift(
            {
              action: () => open("Terminal"),
              label: "Terminal",
            },
            MENU_SEPERATOR,
            {
              action: () => open("FileExplorer"),
              label: "File Explorer",
            },
            {
              action: () => open("Run"),
              label: "Run",
            },
            MENU_SEPERATOR
          );
        } else {
          menuItems.unshift(
            {
              action: () => toggleFullscreen(),
              label: fullscreen ? "Exit full screen" : "Enter full screen",
            },
            MENU_SEPERATOR
          );
        }

        return menuItems;
      }),
    [
      contextMenu,
      fullscreen,
      minimize,
      onStartButton,
      open,
      processesRef,
      toggleFullscreen,
    ]
  );
};

export default useTaskbarContextMenu;
