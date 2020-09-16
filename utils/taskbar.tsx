import { WindowStateCycler } from '@/utils/taskbar.d';

export const cycleWindowState = ({
  id,
  session,
  stackOrder,
  minimized,
  background,
  foreground,
  minimize,
  restore
}: WindowStateCycler): void => {
  if (minimized) {
    restore?.(id);
    foreground?.(id);
  } else if (session?.foregroundId === id) {
    minimize?.(id, stackOrder || []);
    background?.(id);
  } else {
    foreground?.(id);
  }
};
