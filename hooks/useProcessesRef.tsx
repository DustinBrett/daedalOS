import { useProcesses } from "contexts/process";
import type { Processes } from "contexts/process/types";
import { useEffect, useRef } from "react";

export const useProcessesRef = (): React.MutableRefObject<Processes> => {
  const { processes } = useProcesses();
  const processesRef = useRef<Processes>({} as Processes);

  useEffect(() => {
    processesRef.current = processes;
  }, [processes]);

  return processesRef;
};
