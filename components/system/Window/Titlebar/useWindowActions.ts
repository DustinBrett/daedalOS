import { useCallback } from "react";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcessesActions, useProcessesRef } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { PREVENT_SCROLL } from "utils/constants";

type WindowActions = {
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: (keepForegroundId?: boolean) => void;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { setForegroundId, removeFromStack } = useSessionActions();
  const { closeWithTransition, maximize, minimize } = useProcessesActions();
  const processesRef = useProcessesRef();
  const onMinimize = useCallback(
    (keepForegroundId?: boolean): void => {
      minimize(id);
      if (!keepForegroundId) setForegroundId(nextFocusableId);
    },
    [id, minimize, nextFocusableId, setForegroundId]
  );
  const onMaximize = useCallback((): void => {
    const triggerMaximize = (): void => {
      maximize(id);
      setForegroundId(id);
      processesRef.current[id]?.componentWindow?.focus(PREVENT_SCROLL);
    };
    const [currentAnimation] =
      processesRef.current[id]?.componentWindow?.getAnimations() || [];

    if (currentAnimation?.finished) {
      currentAnimation.finished.then(triggerMaximize);
    } else {
      triggerMaximize();
    }
  }, [id, maximize, processesRef, setForegroundId]);
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
