import type { SessionContextState } from 'types/contexts/session';

const useSessionContextState = (): SessionContextState => ({
  theme: undefined // TODO: Load user theme from localStorage
});

export default useSessionContextState;
