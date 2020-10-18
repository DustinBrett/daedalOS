import type { Processes } from '@/types/utils/processmanager';

import { TASKBAR_HEIGHT } from '@/utils/constants';

export const getMaxDimensions = (
  width: number,
  height: number,
  defaultWidth = 0,
  defaultHeight = 0,
  lockAspectRatio = false
): { width: number; height: number } => {
  if (width === defaultWidth && height === defaultHeight) {
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight - TASKBAR_HEIGHT;

    if (lockAspectRatio) {
      const aspectLockedHeight = Math.min(maxWidth, width) * (height / width);

      if (aspectLockedHeight > maxHeight) {
        maxWidth = maxHeight / (height / width);
      } else {
        maxHeight = aspectLockedHeight;
      }
    }

    return {
      height: Math.floor(Math.min(maxHeight, height)),
      width: Math.floor(Math.min(maxWidth, width))
    };
  }

  return { height, width };
};

export const getNextVisibleWindow = (
  processes: Processes,
  stackOrder: string[]
): string => {
  const visibleProcessId = stackOrder.find((stackId) =>
    processes.find((process) => process.id === stackId && !process.minimized)
  );

  return visibleProcessId || '';
};
