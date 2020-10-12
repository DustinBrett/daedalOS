import type { ProcessContextType } from '@/types/contexts/ProcessManager';

import {
  close,
  load,
  maximize,
  minimize,
  open,
  position,
  processReducer,
  restore,
  size,
  taskbarElement,
  title
} from '@/utils/processmanager';
import { createContext, useReducer } from 'react';
import { initialProcessState } from '@/utils/initial';

export const ProcessContext = createContext<ProcessContextType>(
  initialProcessState
);

const ProcessProvider: React.FC = ({ children }) => {
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
        taskbarElement: taskbarElement(updateProcesses),
        title: title(updateProcesses)
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
};

export default ProcessProvider;
