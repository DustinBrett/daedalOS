import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useMemo } from "react";

const useTaskbarContextMenu = (): {
  onContextMenuCapture: React.MouseEventHandler<HTMLElement>;
} => {
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
      label: allWindowsMinimized ? "Show open windows" : "Show the desktop",
      action: toggleDesktop,
    },
  ];

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useTaskbarContextMenu;
