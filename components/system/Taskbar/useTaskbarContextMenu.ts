import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import { useCallback } from "react";

const useTaskbarContextMenu = (): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { minimize, processes } = useProcesses();
  const getItems = useCallback(() => {
    const processArray = Object.entries(processes || {});
    const allWindowsMinimized =
      processArray.length > 0 &&
      !processArray.some(([, { minimized }]) => !minimized);
    const toggleDesktop = (): void =>
      processArray.forEach(
        ([pid, { minimized }]) =>
          (allWindowsMinimized || (!allWindowsMinimized && !minimized)) &&
          minimize(pid)
      );

    return [
      {
        action: toggleDesktop,
        label: allWindowsMinimized ? "Show open windows" : "Show the desktop",
      },
    ];
  }, [minimize, processes]);

  return contextMenu?.(getItems);
};

export default useTaskbarContextMenu;
