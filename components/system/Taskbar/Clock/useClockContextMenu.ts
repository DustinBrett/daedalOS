import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useSession } from "contexts/session";
import { useCallback } from "react";

const useClockContextMenu = (): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { clockSource, setClockSource } = useSession();
  const getItems = useCallback(() => {
    const isLocal = clockSource === "local";

    return [
      {
        action: () => setClockSource("local"),
        label: "Local time",
        toggle: isLocal,
      },
      {
        action: () => setClockSource("ntp"),
        label: "Server time",
        toggle: !isLocal,
      },
    ];
  }, [clockSource, setClockSource]);

  return contextMenu?.(getItems);
};

export default useClockContextMenu;
