import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useMemo } from "react";

const useAddressBarContextMenu = (address: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();

  return useMemo(
    () =>
      contextMenu?.(() => [
        {
          action: () => navigator.clipboard?.writeText(address),
          label: "Copy address",
        },
      ]),
    [address, contextMenu]
  );
};

export default useAddressBarContextMenu;
