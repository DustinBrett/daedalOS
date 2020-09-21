import type { Dispatch } from 'react';
import type { SessionState } from '@/contexts/SessionManager.d';
import type { ProcessState } from '@/utils/pm.d';

import { getProcessId } from '@/utils/pm';

export const background = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string): void =>
  updateSession({
    ...session,
    foregroundId: session.foregroundId === id ? '' : session.foregroundId
  });

export const foreground = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string, removeId?: string): void =>
  updateSession({
    ...session,
    foregroundId: id,
    stackOrder: [
      id,
      ...session.stackOrder.filter(
        (stackId) => ![id, removeId].includes(stackId)
      )
    ]
  });

export const getState = (session: SessionState) => ({
  id,
  name = ''
}: {
  id?: string;
  name?: string;
}): ProcessState => session.states[id || getProcessId(name)] || {};

export const saveState = (
  session: SessionState,
  updateSession: Dispatch<SessionState>
) => (id: string, { height, width, x = 0, y = 0 }: ProcessState): void => {
  if (!session.states) session.states = {};

  const { x: previousX = 0, y: previousY = 0 } = session.states[id] || {};

  session.states[id] = {
    height,
    width,
    x: previousX === x ? x : previousX + x,
    y: previousY === y ? y : previousY + y
  };

  updateSession(session);
};
