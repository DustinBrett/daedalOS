import type { FC } from 'react';
import type {
  SessionContextType,
  SessionState
} from '@/contexts/SessionManager.d';

import { createContext, useState } from 'react';
import { background, foreground, getState, saveState } from '@/utils/session';

export const SessionContext = createContext<SessionContextType>({
  session: {}
});

export const SessionProvider: FC = ({ children }) => {
  const [session, updateSession] = useState<SessionState>({});

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
