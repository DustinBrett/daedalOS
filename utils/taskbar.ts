import type { WindowStateCycler } from '@/types/utils/taskbar';

export const cycleWindowState = ({
  foregroundId,
  id,
  minimized,
  foreground,
  minimize,
  restore
}: WindowStateCycler): void => {
  if (minimized) {
    // TODO: If maximized then don't restore to 0/0
    restore(id, 'minimized');
    foreground(id);
  } else if (foregroundId && foregroundId === id) {
    minimize(id);
    foreground('');
  } else {
    foreground(id);
  }
};
