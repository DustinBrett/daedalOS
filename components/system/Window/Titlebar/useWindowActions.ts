import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useCallback } from "react";

type WindowActions = {
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { setForegroundId, removeFromStack } = useSession();
  const { closeWithTransition, maximize, minimize } = useProcesses();
  const onMinimize = (): void => {
    minimize(id);
    setForegroundId(nextFocusableId);
  };
  const onMaximize = (): void => maximize(id);
  const onClose = useCallback((): void => {
    removeFromStack(id);
    closeWithTransition(id);
    setForegroundId(nextFocusableId);
  }, [
    closeWithTransition,
    id,
    nextFocusableId,
    removeFromStack,
    setForegroundId,
  ]);

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
