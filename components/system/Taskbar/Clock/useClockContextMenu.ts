import { useMemo } from "react";
import { useMenuActions } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useClockSource, useSessionActions } from "contexts/session";

const useClockContextMenu = (
  toggleCalendar: (showCalendar?: boolean) => void
): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();
  const { setClockSource } = useSessionActions();
  const clockSource = useClockSource();

  return useMemo(
    () =>
      contextMenu?.(() => {
        toggleCalendar(false);

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
    [clockSource, contextMenu, setClockSource, toggleCalendar]
  );
};

export default useClockContextMenu;
