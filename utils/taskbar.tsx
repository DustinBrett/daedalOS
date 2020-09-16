import { WindowStateCycler } from '@/utils/taskbar.d';

export const cycleWindowState = ({
  id,
  session,
  minimized,
  background,
  foreground,
  minimize,
  restore
}: WindowStateCycler): void => {
  if (minimized) {
    restore?.(id);
    foreground?.(id);
  } else if (session.foreground === id) {
    minimize?.(id);
    background?.(id);
  } else {
    foreground?.(id);
  }
};
