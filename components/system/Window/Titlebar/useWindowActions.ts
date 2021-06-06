import { closeWithTransition } from 'components/system/Window/functions';
import useNextFocusable from 'components/system/Window/useNextFocusable';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useCallback } from 'react';

type WindowActions = {
  onClose: React.MouseEventHandler;
  onMaximize: React.MouseEventHandler;
  onMinimize: React.MouseEventHandler;
};

const useWindowActions = (id: string): WindowActions => {
  const nextFocusableId = useNextFocusable(id);
  const { setForegroundId, removeFromStack } = useSession();
  const { close, maximize, minimize } = useProcesses();
  const onMinimize = useCallback(() => {
    minimize(id);
    setForegroundId(nextFocusableId);
  }, [id, minimize, nextFocusableId, setForegroundId]);
  const onMaximize = useCallback(() => maximize(id), [id, maximize]);
  const onClose = useCallback(() => {
    removeFromStack(id);
    closeWithTransition(close, id);
    setForegroundId(nextFocusableId);
  }, [removeFromStack, id, close, setForegroundId, nextFocusableId]);

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
