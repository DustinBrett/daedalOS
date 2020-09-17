import type { Dispatch } from 'react';
import type { SessionState } from '@/contexts/SessionManager.d';

export const background = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id?: string): void => {
  id &&
    updateSession({
      ...session,
      foregroundId: session.foregroundId === id ? '' : session.foregroundId
    });
};

export const foreground = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id?: string): void => {
  id &&
    updateSession({
      ...session,
      foregroundId: id,
      stackOrder: [
        id,
        ...(session.stackOrder || []).filter((stackId) => stackId !== id)
      ]
    });
};
