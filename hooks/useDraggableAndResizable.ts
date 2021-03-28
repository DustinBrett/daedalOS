import { useCallback, useMemo, useState } from 'react';
import type { DraggableEventHandler } from 'react-draggable';
import type { Position, RndResizeCallback } from 'react-rnd';
import { useTheme } from 'styled-components';
import { DEFAULT_WINDOW_POSITION, DEFAULT_WINDOW_SIZE } from 'utils/constants';

export type Size = {
  height: string;
  width: string;
};

type Draggable = Position & {
  updatePosition: DraggableEventHandler;
};

type Resizable = Size & {
  updateSize: RndResizeCallback;
};

type DraggableAndResizable = Resizable & Draggable;

const useDraggableAndResizable = (maximized = false): DraggableAndResizable => {
  const { sizes } = useTheme();
  const [{ height, width }, setSize] = useState<Size>(DEFAULT_WINDOW_SIZE);
  const [{ x, y }, setPosition] = useState<Position>(DEFAULT_WINDOW_POSITION);
  const updatePosition = useCallback<DraggableEventHandler>(
    (_event, { x: positionX, y: positionY }) =>
      setPosition({ x: positionX, y: positionY }),
    []
  );
  const updateSize = useCallback<RndResizeCallback>(
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
    []
  );
  const taskbarHeight = useMemo(
    () => Number(sizes.taskbar.height.replace('px', '')),
    [sizes.taskbar.height]
  );

  return {
    x: maximized ? 0 : x,
    y: maximized ? 0 : y,
    updatePosition,
    height: maximized ? `${window.innerHeight - taskbarHeight}px` : height,
    width: maximized ? '100%' : width,
    updateSize
  };
};

export default useDraggableAndResizable;
