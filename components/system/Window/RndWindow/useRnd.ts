import rndDefaults from 'components/system/Window/RndWindow/rndDefaults';
import useDraggable from 'components/system/Window/RndWindow/useDraggable';
import useResizable from 'components/system/Window/RndWindow/useResizable';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useCallback } from 'react';
import type { DraggableEventHandler } from 'react-draggable';
import type { Props, RndResizeCallback } from 'react-rnd';

const useRnd = (id: string, maximized = false): Props => {
  const {
    processes: {
      [id]: { autoSizing }
    }
  } = useProcesses();
  const {
    windowStates: { [id]: windowState }
  } = useSession();
  const { position: statePosition, size: stateSize } = windowState || {};
  const [position, setPosition] = useDraggable(maximized, statePosition);
  const [size, setSize] = useResizable(maximized, autoSizing, stateSize);
  const onDragStop = useCallback<DraggableEventHandler>(
    (_event, { x: positionX, y: positionY }) =>
      setPosition({ x: positionX, y: positionY }),
    [setPosition]
  );
  const onResizeStop = useCallback<RndResizeCallback>(
    (
      _event,
      _direction,
      { style: { height: elementHeight, width: elementWidth } },
      _delta,
      { x: positionX, y: positionY }
    ) => {
      setSize({ height: elementHeight, width: elementWidth });
      setPosition({ x: positionX, y: positionY });
    },
    [setPosition, setSize]
  );

  return {
    disableDragging: maximized,
    enableResizing: !maximized && !autoSizing,
    onDragStop,
    onResizeStop,
    position,
    size,
    ...rndDefaults
  };
};

export default useRnd;
