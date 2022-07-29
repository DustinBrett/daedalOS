import { useMenu } from "contexts/menu";
import type { ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useCallback } from "react";

const useAddressBarContextMenu = (address: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const getItems = useCallback(() => {
    return [
      {
        action: () => navigator.clipboard?.writeText(address),
        label: "Copy address",
      },
    ];
  }, [address]);

  return contextMenu?.(getItems);
};

export default useAddressBarContextMenu;
