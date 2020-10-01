import type { Processes } from '@/types/utils/processmanager';

import { TASKBAR_HEIGHT, CASCADE_PADDING } from '@/utils/constants';

export const getMaxDimensions = (
  width: number,
  height: number,
  defaultWidth = 0,
  defaultHeight = 0,
  lockAspectRatio = false
): { width: number; height: number } => {
  if (width === defaultWidth && height === defaultHeight) {
    let maxWidth = window.innerWidth - CASCADE_PADDING * 2;
    let maxHeight = window.innerHeight - CASCADE_PADDING * 2 - TASKBAR_HEIGHT;

    if (lockAspectRatio) {
      const aspectLockedHeight = Math.min(maxWidth, width) * (height / width);

      if (aspectLockedHeight > maxHeight) {
        maxWidth = maxHeight / (height / width);
      } else {
        maxHeight = aspectLockedHeight;
      }
    }

    return {
      height: Math.min(maxHeight, height),
      width: Math.min(maxWidth, width)
    };
  }

  return { height, width };
};

export const focusNextVisibleWindow = (
  stackOrder: string[],
  processes: Processes,
  foreground: (id: string) => void
): void => {
  const [, ...remainingStackEntries] = stackOrder;
  const visibleProcessId = remainingStackEntries.find((stackId) =>
    processes.find((process) => process.id === stackId && !process.minimized)
  );

  if (visibleProcessId) foreground(visibleProcessId);
};
