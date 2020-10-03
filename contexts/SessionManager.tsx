import type { SessionContextType } from '@/types/contexts/SessionManager';

import { createContext, useReducer } from 'react';
import { foreground, getState, saveState } from '@/utils/session';
import { initialSessionState } from '@/utils/initial';
import { sessionReducer } from '@/utils/sessionmanager';

export const SessionContext = createContext<SessionContextType>(
  initialSessionState
);

const SessionProvider: React.FC = ({ children }) => {
  const [session, updateSession] = useReducer(
    sessionReducer,
    initialSessionState.session
  );

  return (
    <SessionContext.Provider
      value={{
        session,
        foreground: foreground(updateSession),
        getState: getState(session),
        saveState: saveState(session, updateSession)
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
