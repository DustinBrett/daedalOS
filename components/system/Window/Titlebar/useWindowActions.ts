import { useCallback } from "react";
import useNextFocusable from "components/system/Window/useNextFocusable";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useProcessesRef } from "hooks/useProcessesRef";
import { PREVENT_SCROLL } from "utils/constants";

type WindowActions = {
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { setForegroundId, removeFromStack } = useSession();
  const { closeWithTransition, maximize, minimize } = useProcesses();
  const processesRef = useProcessesRef();
  const onMinimize = useCallback((): void => {
    minimize(id);
    setForegroundId(nextFocusableId);
  }, [id, minimize, nextFocusableId, setForegroundId]);
  const onMaximize = useCallback((): void => {
    maximize(id);
    processesRef.current[id]?.componentWindow?.focus(PREVENT_SCROLL);
  }, [id, maximize, processesRef]);
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
