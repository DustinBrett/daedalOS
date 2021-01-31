import useProcessContextState from 'hooks/useProcessContextState';
import type { FC } from 'react';
import { createContext } from 'react';
import type { ProcessContextState } from 'types/contexts/process';
import { initialProccessContextState } from 'utils/initialContextStates';
import processDirectory from 'utils/processDirectory';

const ProcessContext = createContext<ProcessContextState>(
  initialProccessContextState
);

export const ProcessProvider: FC = ({ children }) => (
  <ProcessContext.Provider value={useProcessContextState(processDirectory)}>
    {children}
  </ProcessContext.Provider>
);

export const ProcessConsumer = ProcessContext.Consumer;
