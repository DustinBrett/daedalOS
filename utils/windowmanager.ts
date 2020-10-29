import type { Processes } from '@/types/utils/processmanager';

import { TASKBAR_HEIGHT, WINDOW_PADDING } from '@/utils/constants';

export const getMaxDimensions = (
  width: number,
  height: number,
  defaultWidth = 0,
  defaultHeight = 0,
  lockAspectRatio = false
): { width: number; height: number } => {
  if (width === defaultWidth && height === defaultHeight) {
    const PADDING = WINDOW_PADDING * 2;
    let maxWidth = window.innerWidth - PADDING;
    let maxHeight = window.innerHeight - TASKBAR_HEIGHT - PADDING;

    if (lockAspectRatio) {
      const aspectLockedHeight = (height / width) * Math.min(maxWidth, width);

      if (aspectLockedHeight > maxHeight) {
        maxWidth = maxHeight / (height / width);
      } else {
        maxHeight = aspectLockedHeight;
      }
    }

    return {
      height: Math.ceil(Math.min(maxHeight, height)),
      width: Math.ceil(Math.min(maxWidth, width))
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
