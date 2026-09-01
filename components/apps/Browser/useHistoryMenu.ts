import { useMemo } from "react";
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
    backMenu: useMemo(
      () =>
        contextMenu?.(() =>
          history
            .filter((_url, index) => index < position)
            .map((url, index) => ({
              action: () => moveHistory(index - position),
              label: url,
            }))
            .reverse()
        ),
      [contextMenu, history, moveHistory, position]
    ),
    forwardMenu: useMemo(
      () =>
        contextMenu?.(() =>
          history
            .filter((_url, index) => index > position)
            .map((url, index) => ({
              action: () => moveHistory(index + 1),
              label: url,
            }))
        ),
      [contextMenu, history, moveHistory, position]
    ),
  };
};

export default useHistoryMenu;
