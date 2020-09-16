import type { Dispatch } from 'react';
import type { SessionState } from '@/contexts/SessionManager.d';

export const background = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string): void => {
  updateSession({
    ...session,
    foreground: session.foreground === id ? '' : session.foreground
  });
};

export const foreground = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string): void => {
  updateSession({
    ...session,
    foreground: id,
    stackOrder: [
      id,
      ...(session.stackOrder || []).filter((stackId) => stackId !== id)
    ]
  });
};
