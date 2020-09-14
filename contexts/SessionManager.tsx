import type { FC } from 'react';
import type {
  SessionContextType,
  SessionState
} from '@/contexts/SessionManager.d';

import { createContext, useState } from 'react';
import { background, foreground } from '@/utils/session';

export const SessionContext = createContext<SessionContextType>(
  { session: {} }
);

export const SessionProvider: FC = ({ children }) => {
  const [session, updateSession] = useState<SessionState>({});

  return (
    <SessionContext.Provider
      value={{
        session,
        background: background(session, updateSession),
        foreground: foreground(session, updateSession)
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
