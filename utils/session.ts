import type { Dispatch } from 'react';
import type { SessionState } from '@/contexts/SessionManager.d';
import type { ProcessState } from '@/utils/pm.d';

import { getProcessId } from '@/utils/pm';

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

export const getState = (session: SessionState) => (
  name: string
): ProcessState | undefined => session.states?.[getProcessId(name)];

export const saveState = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string, { height, width, x = 0, y = 0 }: ProcessState): void => {
  if (!session.states) session.states = {};

  session.states[id] = {
    height,
    width,
    x,
    y
  };

  updateSession(session);
};
