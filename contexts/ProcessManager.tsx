import type { FC } from 'react';
import type { ProcessContextType } from '@/contexts/ProcessManager.d';

import { createContext, useReducer } from 'react';
import {
  close,
  focus,
  maximize,
  minimize,
  open,
  position,
  size,
  title
} from '@/utils/process';
import { processReducer } from '@/utils/pm';

export const ProcessContext = createContext<ProcessContextType>({
  processes: []
});

export const ProcessProvider: FC = ({ children }) => {
  const [processes, updateProcesses] = useReducer(processReducer, []);

  return (
    <ProcessContext.Provider
      value={{
        processes,
        close: close(processes, updateProcesses),
        focus: focus(processes, updateProcesses),
        maximize: maximize(updateProcesses),
        minimize: minimize(updateProcesses),
        open: open(processes, updateProcesses),
        position: position(updateProcesses),
        size: size(updateProcesses),
        title: title(updateProcesses)
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
};

export default ProcessProvider;
