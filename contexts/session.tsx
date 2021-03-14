import type { SessionContextState } from 'hooks/useSessionContextState';
import useSessionContextState from 'hooks/useSessionContextState';
import contextFactory from 'utils/contextFactory';
import { initialSessionContextState } from 'utils/initialContextStates';

const { Consumer, Provider, useContext } = contextFactory<SessionContextState>(
  initialSessionContextState,
  useSessionContextState
);

export {
  Consumer as SessionConsumer,
  Provider as SessionProvider,
  useContext as useSession
};
