import { dirname } from "path";
import { useMemo } from "react";
import { OpenFolder } from "components/system/Taskbar/Search/Icons";
import { useMenuActions } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useProcessesActions } from "contexts/process";

const useResultsContextMenu = (url: string): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();
  const { open } = useProcessesActions();

  return useMemo(
    () =>
      contextMenu?.(() => [
        {
          SvgIcon: OpenFolder,
          action: () => open("FileExplorer", { url: dirname(url) }, ""),
          label: "Open file location",
        },
      ]),
    [contextMenu, open, url]
  );
};

export default useResultsContextMenu;
