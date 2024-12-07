import { useEffect, useRef } from "react";
import { useProcesses } from "contexts/process";
import { type Processes } from "contexts/process/types";

export const useProcessesRef = (): React.RefObject<Processes> => {
  const { processes } = useProcesses();
  const processesRef = useRef<Processes>({} as Processes);

  useEffect(() => {
    processesRef.current = processes;
  }, [processes]);

  return processesRef;
};
