import type { FC } from 'react';
import { createContext, useState } from 'react';
import type { Processes } from 'types/utils/processDirectory';
import processDirectory from 'utils/processDirectory';

type ProcessContextState = {
  processes: Processes;
};

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
