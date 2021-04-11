import type { Process, Processes } from 'contexts/process/directory';
import {
  closeProcess,
  maximizeProcess,
  minimizeProcess,
  openProcess
} from 'contexts/process/functions';
import { useCallback, useState } from 'react';

type ProcessesMap = (
  callback: ([id, process]: [string, Process]) => JSX.Element
) => JSX.Element[];

export type ProcessContextState = {
  close: (id: string) => void;
  open: (id: string, url: string) => void;
  mapProcesses: ProcessesMap;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  processes: Processes;
};

const useProcessContextState = (): ProcessContextState => {
  const [processes, setProcesses] = useState<Processes>({});
  const mapProcesses = useCallback<ProcessesMap>(
    (callback) => Object.entries(processes).map(callback),
    [processes]
  );
  const close = useCallback((id: string) => setProcesses(closeProcess(id)), []);
  const maximize = useCallback(
    (id: string) => setProcesses(maximizeProcess(id)),
    []
  );
  const minimize = useCallback(
    (id: string) => setProcesses(minimizeProcess(id)),
    []
  );
  const open = useCallback(
    (id: string, url: string) => setProcesses(openProcess(id, url)),
    []
  );

  return { close, open, mapProcesses, maximize, minimize, processes };
};

export default useProcessContextState;
