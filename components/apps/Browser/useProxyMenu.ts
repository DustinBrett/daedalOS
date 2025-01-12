import { useMemo } from "react";
import { OLD_NET_SUPPORTED_YEARS } from "components/apps/Browser/config";
import { useMenu } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";

export type ProxyState = `CORS` | `OLD_NET_${number}` | "WAYBACK_MACHINE";

const useProxyMenu = (
  proxyState: ProxyState,
  setProxyState: React.Dispatch<React.SetStateAction<ProxyState>>
): ContextMenuCapture => {
  const { contextMenu } = useMenu();

  return useMemo(
    () =>
      contextMenu?.(() => [
        {
          action: () => setProxyState("CORS"),
          checked: proxyState === "CORS",
          label: "Local w/CORS",
        },
        {
          action: () => setProxyState("WAYBACK_MACHINE"),
          checked: proxyState === "WAYBACK_MACHINE",
          label: "Wayback Machine",
        },
        {
          checked: proxyState.startsWith("OLD_NET_"),
          label: "The Old Net",
          menu: OLD_NET_SUPPORTED_YEARS.map((year) => ({
            action: () => setProxyState(`OLD_NET_${year}`),
            checked: proxyState === `OLD_NET_${year}`,
            label: year.toString(),
          })),
        },
      ]),
    [contextMenu, proxyState, setProxyState]
  );
};

export default useProxyMenu;
