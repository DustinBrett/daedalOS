import { useMemo } from "react";
import { useMenu } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";

const useBookmarkMenu = (): ContextMenuCapture => {
  const { contextMenu } = useMenu();

  return useMemo(
    () =>
      contextMenu?.((event) => [
        {
          action: () =>
            event?.target?.dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                ctrlKey: true,
              })
            ),
          label: "Open in new window",
        },
      ]),
    [contextMenu]
  );
};

export default useBookmarkMenu;
