import type { WindowStateCycler } from '@/types/utils/taskbar';

export const cycleWindowState = ({
  id,
  session: { foregroundId },
  minimized,
  background,
  foreground,
  minimize,
  restore
}: WindowStateCycler): void => {
  if (minimized) {
    restore(id);
    foreground(id);
  } else if (foregroundId && foregroundId === id) {
    minimize(id);
    background(id);
  } else {
    foreground(id);
  }
};
