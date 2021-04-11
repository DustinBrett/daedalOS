import contextFactory from 'contexts/contextFactory';
import { initialSessionContextState } from 'contexts/initialContextStates';
import type { SessionContextState } from 'contexts/session/useSessionContextState';
import useSessionContextState from 'contexts/session/useSessionContextState';

const { Consumer, Provider, useContext } = contextFactory<SessionContextState>(
  initialSessionContextState,
  useSessionContextState
);

export {
  Consumer as SessionConsumer,
  Provider as SessionProvider,
  useContext as useSession
};
