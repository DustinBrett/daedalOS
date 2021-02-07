import contextFactory from 'contexts/contextFactory';
import useSessionContextState from 'hooks/useSessionContextState';
import type { SessionContextState } from 'types/contexts/session';
import { initialSessionContextState } from 'utils/initialContextStates';

const { Consumer, Provider } = contextFactory<SessionContextState>(
  initialSessionContextState,
  useSessionContextState
);

export { Consumer as SessionConsumer, Provider as SessionProvider };
