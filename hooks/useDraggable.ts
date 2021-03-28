import { useState } from 'react';
import type { Position } from 'react-rnd';
import { DEFAULT_WINDOW_POSITION } from 'utils/constants';

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (
  maximized = false,
  position = DEFAULT_WINDOW_POSITION
): Draggable => {
  const [{ x, y }, setPosition] = useState<Position>(position);

  return [{ x: maximized ? 0 : x, y: maximized ? 0 : y }, setPosition];
};

export default useDraggable;
