import type { Size } from 'components/system/Window/RndWindow/useResizable';
import type { Position } from 'react-rnd';
import { pxToNum } from 'utils/functions';

export const centerPosition = (
  { height, width }: Size,
  taskbarHeight: string
): Position => {
  const { innerHeight: vh, innerWidth: vw } = window;

  return {
    x: Math.floor(vw / 2 - pxToNum(width) / 2),
    y: Math.floor((vh - pxToNum(taskbarHeight)) / 2 - pxToNum(height) / 2)
  };
};
