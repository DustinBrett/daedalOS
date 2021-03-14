import { useCallback, useState } from 'react';
import type { DraggableEventHandler } from 'react-draggable';

type Position = {
  x: number;
  y: number;
};

type Draggable = Position & {
  updatePosition: DraggableEventHandler;
};

const defaultWindowPosition = {
  x: 0,
  y: 0
};

const useDraggable = (maximized = false): Draggable => {
  const [{ x, y }, setPosition] = useState<Position>(defaultWindowPosition);
  const updatePosition = useCallback<DraggableEventHandler>(
    (_event, { x: elementX, y: elementY }) =>
      setPosition({ x: elementX, y: elementY }),
    []
  );

  return {
    x: maximized ? 0 : x,
    y: maximized ? 0 : y,
    updatePosition
  };
};

export default useDraggable;
