import useNextFocusable from 'components/system/Window/useNextFocusable';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useCallback } from 'react';
import { WINDOW_TRANSITION_DURATION_IN_MILLISECONDS } from 'utils/constants';

type WindowActions = {
  onClose: React.MouseEventHandler;
  onMaximize: React.MouseEventHandler;
  onMinimize: React.MouseEventHandler;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { setForegroundId, setStackOrder } = useSession();
  const { close, maximize, minimize } = useProcesses();
  const onMinimize = useCallback(() => {
    minimize(id);
    setForegroundId(nextFocusableId);
  }, [id, minimize, nextFocusableId, setForegroundId]);
  const onMaximize = useCallback(() => maximize(id), [id, maximize]);
  const onClose = useCallback(() => {
    setStackOrder((currentStackOrder) =>
      currentStackOrder.filter((stackId) => stackId !== id)
    );
    close(id, true);
    setTimeout(() => close(id), WINDOW_TRANSITION_DURATION_IN_MILLISECONDS);
    setForegroundId(nextFocusableId);
  }, [setStackOrder, close, id, setForegroundId, nextFocusableId]);

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
