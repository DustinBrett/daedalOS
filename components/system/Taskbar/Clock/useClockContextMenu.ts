import { useMemo } from "react";
import { useMenu } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useSession } from "contexts/session";

const useClockContextMenu = (
  toggleCalendar: (showCalendar?: boolean) => void
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { clockSource, setClockSource } = useSession();

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
