import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useSession } from "contexts/session";
import { useMemo } from "react";

const useClockContextMenu = (): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { clockSource, setClockSource } = useSession();

  return useMemo(
    () =>
      contextMenu?.(() => {
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
      }),
    [clockSource, contextMenu, setClockSource]
  );
};

export default useClockContextMenu;
