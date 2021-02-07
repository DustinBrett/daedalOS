import useSessionContextState from 'hooks/useSessionContextState';
import { createContext } from 'react';
import type { SessionContextState } from 'types/contexts/session';
import { initialSessionContextState } from 'utils/initialContextStates';

const { Consumer, Provider } = createContext<SessionContextState>(
  initialSessionContextState
);

export const SessionProvider: React.FC = ({ children }) => (
  <Provider value={useSessionContextState()}>{children}</Provider>
);

export const SessionConsumer = Consumer;
