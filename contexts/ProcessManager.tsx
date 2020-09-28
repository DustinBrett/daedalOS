import type { ProcessContextType } from '@/types/contexts/ProcessManager';

import { createContext, useReducer } from 'react';
import {
  close,
  load,
  maximize,
  minimize,
  open,
  position,
  restore,
  size,
  title
} from '@/utils/process';
import { processReducer } from '@/utils/processmanager';
import { initialProcessState } from '@/utils/initial';

export const ProcessContext = createContext<ProcessContextType>(
  initialProcessState
);

export const ProcessProvider: React.FC = ({ children }) => {
  const [processes, updateProcesses] = useReducer(
    processReducer,
    initialProcessState.processes
  );

  return (
    <ProcessContext.Provider
      value={{
        processes,
        close: close(updateProcesses),
        load: load(processes, updateProcesses),
        maximize: maximize(updateProcesses),
        minimize: minimize(updateProcesses),
        open: open(processes, updateProcesses),
        position: position(updateProcesses),
        restore: restore(updateProcesses),
        size: size(updateProcesses),
        title: title(updateProcesses)
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
};

export default ProcessProvider;
