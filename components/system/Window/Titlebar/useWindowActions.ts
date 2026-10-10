import useNextFocusable from "components/system/Window/useNextFocusable";
import { getProcess, useProcessesActions } from "contexts/process";
import { useSessionActions } from "contexts/session";
import { focusDesktop, focusWithin } from "utils/keyboard";

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
    const { componentWindow, minimized } = getProcess(id) || {};

    minimize(id);
    // Once no longer inert, a restored window gets its focus back, like Windows
    if (minimized) requestAnimationFrame(() => focusWithin(componentWindow));

    if (!keepForegroundId) {
      setForegroundId(nextFocusableId);
      if (!nextFocusableId) focusDesktop();
    }
  };
  const onMaximize = (): void => {
    const { componentWindow } = getProcess(id) || {};
    const triggerMaximize = (): void => {
      const maximized = !getProcess(id)?.maximized;

      maximize(id, maximized);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: { ...currentWindowStates[id], maximized },
      }));
      setForegroundId(id);
      focusWithin(componentWindow);
    };
    // Missing before Chrome 84 & Firefox 75
    const [currentAnimation] = componentWindow?.getAnimations?.() || [];

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
    if (!nextFocusableId) focusDesktop();
  };

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
