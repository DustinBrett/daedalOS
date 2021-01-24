import type { FC } from 'react';
import { createContext, useState } from 'react';
import type { ProcessContextState } from 'types/contexts/process';
import processDirectory from 'utils/processDirectory';

const ProcessContext = createContext<ProcessContextState>({ processes: {} });

export const ProcessProvider: FC = ({ children }) => {
  const [processes] = useState(processDirectory);

  return (
    <ProcessContext.Provider value={{ processes }}>
      {children}
    </ProcessContext.Provider>
  );
};

export const ProcessConsumer = ProcessContext.Consumer;
