import type { Dispatch } from 'react';
import type {
  SessionAction,
  SessionProcessState,
  SessionState
} from '@/types/contexts/SessionManager';

import { getProcessId } from '@/utils/process';

export const foreground = (updateSession: Dispatch<SessionAction>) => (
  id: string
): void => updateSession({ foregroundId: id });

export const getState = (session: SessionState) => ({
  id,
  name = ''
}: {
  id?: string;
  name?: string;
}): SessionProcessState => session.states[id || getProcessId(name)] || {};

export const saveState = (
  session: SessionState,
  updateSession: Dispatch<SessionAction>
) => ({
  id,
  height = 0,
  width = 0,
  x = 0,
  y = 0
}: SessionProcessState): void => {
  const { x: previousX = 0, y: previousY = 0 } = session.states[id] || {};

  updateSession({
    state: {
      id,
      height,
      width,
      x: previousX === x ? x : previousX + x,
      y: previousY === y ? y : previousY + y
    }
  });
};
