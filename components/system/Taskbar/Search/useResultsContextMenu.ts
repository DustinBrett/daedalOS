import { dirname } from "path";
import { OpenFolder } from "components/system/Taskbar/Search/Icons";
import { useMenuActions } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useProcessesActions } from "contexts/process";

const useResultsContextMenu = (url: string): ContextMenuCapture => {
  const { contextMenu } = useMenuActions();
  const { open } = useProcessesActions();

  return contextMenu(() => [
    {
      action: () => open("FileExplorer", { url: dirname(url) }, ""),
      label: "Open file location",
      SvgIcon: OpenFolder,
    },
  ]);
};

export default useResultsContextMenu;
