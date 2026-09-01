import { useMemo } from "react";
import { useMenuActions } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { writeTextToClipboard } from "utils/functions";

const useAddressBarContextMenu = (address: string): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();

  return useMemo(
    () =>
      contextMenu?.(() => [
        {
          action: () => writeTextToClipboard(address),
          label: "Copy address",
        },
      ]),
    [address, contextMenu]
  );
};

export default useAddressBarContextMenu;
