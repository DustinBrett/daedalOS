import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useCallback, useEffect, useMemo } from 'react';

type Focusable = {
  onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLElement>) => void;
  tabIndex: number;
  zIndex: number;
};

const useFocusable = (
  id: string,
  windowRef: React.MutableRefObject<HTMLElement | null>
): Focusable => {
  const {
    foregroundId,
    setForegroundId,
    setStackOrder,
    stackOrder
  } = useSession();
  const zIndex = stackOrder.length - stackOrder.indexOf(id) + 1;
  const isForeground = useMemo(() => id === foregroundId, [foregroundId, id]);
  const {
    processes: { [id]: { taskbarEntry = undefined } = {} }
  } = useProcesses();
  const onBlur = useCallback(
    ({ relatedTarget }) => {
      if (isForeground && relatedTarget !== taskbarEntry) setForegroundId('');
    },
    [isForeground, setForegroundId, taskbarEntry]
  );
  const moveToFront = useCallback(() => {
    setStackOrder((currentStackOrder) => [
      id,
      ...currentStackOrder.filter((stackId) => stackId !== id)
    ]);
    setForegroundId(id);
    windowRef.current?.focus();
  }, [id, setForegroundId, setStackOrder, windowRef]);

  useEffect(() => {
    if (isForeground) moveToFront();
  }, [isForeground, moveToFront]);

  useEffect(moveToFront, [moveToFront]);

  return {
    onBlur,
    onFocus: moveToFront,
    tabIndex: -1,
    zIndex
  };
};

export default useFocusable;
