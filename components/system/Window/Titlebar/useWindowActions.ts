import useNextFocusable from "components/system/Window/useNextFocusable";
import { getProcess, useProcessesActions } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { PREVENT_SCROLL } from "utils/constants";

type WindowActions = {
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: (keepForegroundId?: boolean) => void;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { removeFromStack, setForegroundId, setWindowStates } =
    useSessionActions();
  const { closeWithTransition, maximize, minimize } = useProcessesActions();
  const onMinimize = (keepForegroundId?: boolean): void => {
    minimize(id);
    if (!keepForegroundId) setForegroundId(nextFocusableId);
  };
  const onMaximize = (): void => {
    const triggerMaximize = (): void => {
      const maximized = !getProcess(id)?.maximized;

      maximize(id, maximized);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: { ...currentWindowStates[id], maximized },
      }));
      setForegroundId(id);
      getProcess(id)?.componentWindow?.focus(PREVENT_SCROLL);
    };
    const [currentAnimation] =
      getProcess(id)?.componentWindow?.getAnimations() || [];

    if (currentAnimation?.finished) {
      currentAnimation.finished.then(triggerMaximize);
    } else {
      triggerMaximize();
    }
  };
  const onClose = (): void => {
    removeFromStack(id);
    closeWithTransition(id);
    setForegroundId(nextFocusableId);
  };

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
