import { useMenuActions } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";

const useHistoryMenu = (
  history: string[],
  position: number,
  moveHistory: (step: number) => void
): {
  backMenu: ContextMenuCapture;
  forwardMenu: ContextMenuCapture;
} => {
  const { contextMenu } = useMenuActions();

  return {
    backMenu: contextMenu(() =>
      history
        .filter((_url, index) => index < position)
        .map((url, index) => ({
          action: () => moveHistory(index - position),
          label: url,
        }))
        .reverse()
    ),
    forwardMenu: contextMenu(() =>
      history
        .filter((_url, index) => index > position)
        .map((url, index) => ({
          action: () => moveHistory(index + 1),
          label: url,
        }))
    ),
  };
};

export default useHistoryMenu;
