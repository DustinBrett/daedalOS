import { useMenu } from "contexts/menu";
import type {
  ContextMenuCapture,
  MenuItem,
} from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useMemo } from "react";

const useTaskbarContextMenu = (): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { minimize, processes } = useProcesses();
  const processArray = Object.entries(processes || {});
  const allWindowsMinimized = useMemo(
    () =>
      processArray.length > 0 &&
      !processArray.some(([, { minimized }]) => !minimized),
    [processArray]
  );
  const toggleDesktop = (): void =>
    processArray.forEach(
      ([pid, { minimized }]) =>
        (allWindowsMinimized || (!allWindowsMinimized && !minimized)) &&
        minimize(pid)
    );
  const menuItems: MenuItem[] = [
    {
      action: toggleDesktop,
      label: allWindowsMinimized ? "Show open windows" : "Show the desktop",
    },
  ];

  return contextMenu(menuItems);
};

export default useTaskbarContextMenu;
