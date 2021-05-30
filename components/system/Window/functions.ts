import type { Size } from 'components/system/Window/RndWindow/useResizable';
import type { ProcessContextState } from 'contexts/process/useProcessContextState';
import type { Position } from 'react-rnd';
import { WINDOW_TRANSITION_DURATION_IN_MILLISECONDS } from 'utils/constants';
import { pxToNum } from 'utils/functions';

type processCloser = ProcessContextState['close'];

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

export const closeWithTransition = (close: processCloser, id: string): void => {
  close(id, true);
  setTimeout(() => close(id), WINDOW_TRANSITION_DURATION_IN_MILLISECONDS);
};
