import type {
  SessionState,
  SessionAction,
  SessionProcessState
} from '@/types/contexts/SessionManager';

const updateState = (
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

const updateForground = (
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
  if (state) return updateState(session, state);
  if (typeof foregroundId === 'string')
    return updateForground(session, foregroundId);
  return session;
};
