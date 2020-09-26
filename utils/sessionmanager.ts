import type {
  SessionState,
  SessionAction,
  SessionProcessStates
} from '@/types/contexts/SessionManager';

const updateState = (
  session: SessionState,
  state: SessionProcessStates = {}
): SessionState => ({
  ...session,
  states: {
    ...session.states,
    ...state
  }
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
