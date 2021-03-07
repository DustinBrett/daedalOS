import { useCallback, useState } from 'react';
import type {
  ProcessContextState,
  Processes,
  ProcessesMap
} from 'types/contexts/process';
import { closeProcess, openProcess } from 'utils/processFunctions';

const useProcessContextState = (): ProcessContextState => {
  const [processes, setProcesses] = useState<Processes>({});
  const mapProcesses = useCallback<ProcessesMap>(
    (callback) => Object.entries(processes).map(callback),
    [processes]
  );
  const close = useCallback((id: string) => setProcesses(closeProcess(id)), []);
  const open = useCallback((id: string) => setProcesses(openProcess(id)), []);

  return { close, open, mapProcesses };
};

export default useProcessContextState;
