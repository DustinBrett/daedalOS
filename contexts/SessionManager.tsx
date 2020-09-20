import type { FC } from 'react';
import type {
  SessionContextType,
  SessionState
} from '@/contexts/SessionManager.d';

import { createContext, useState } from 'react';
import { background, foreground, getState, saveState } from '@/utils/session';
import { initialSessionState } from '@/utils/initial';

export const SessionContext = createContext<SessionContextType>(
  initialSessionState
);

export const SessionProvider: FC = ({ children }) => {
  const [session, updateSession] = useState<SessionState>(
    initialSessionState.session
  );

  return (
    <SessionContext.Provider
      value={{
        session,
        background: background(session, updateSession),
        foreground: foreground(session, updateSession),
        getState: getState(session),
        saveState: saveState(session, updateSession)
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
