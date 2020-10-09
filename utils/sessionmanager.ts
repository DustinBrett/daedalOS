import type {
  SessionAction,
  SessionProcessState,
  SessionState
} from '@/types/contexts/SessionManager';

const saveState = (
  session: SessionState,
  state: SessionProcessState
): SessionState => ({
  ...session,
  states: {
    ...session.states,
    [state.id]: state
  },
  stackOrder: session.stackOrder.filter((stackId) => stackId !== state.id)
});

const changeForground = (
  session: SessionState,
  foregroundId: string
): SessionState => ({
  ...session,
  foregroundId,
  stackOrder: [
    ...(foregroundId ? [foregroundId] : []),
    ...session.stackOrder.filter((stackId) => stackId !== foregroundId)
  ]
});

export const sessionReducer = (
  session: SessionState,
  { foregroundId, state }: SessionAction
): SessionState => {
  if (state) return saveState(session, state);
  if (typeof foregroundId === 'string')
    return changeForground(session, foregroundId);
  return session;
};
