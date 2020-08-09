import type { WindowStateCycler } from '@/types/utils/taskbar';

export const cycleWindowState = ({
  id,
  session: { foregroundId },
  minimized,
  foreground,
  minimize,
  restore
}: WindowStateCycler): void => {
  if (minimized) {
    restore(id, 'minimized');
    foreground(id);
  } else if (foregroundId && foregroundId === id) {
    minimize(id);
    foreground('');
  } else {
    foreground(id);
  }
};
