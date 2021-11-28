import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { useCallback } from "react";

type UseFile = (pid: string, icon?: string) => void;

const useFile = (url: string): UseFile => {
  const { setForegroundId } = useSession();
  const { minimize, open, processes } = useProcesses();

  return useCallback(
    (pid: string, icon?: string) => {
      const { singleton, icon: processIcon } = processDirectory[pid] || {};

      if (singleton && processes[pid]) {
        if (processes[pid].minimized) minimize(pid);
        setForegroundId(pid);
      } else {
        open(pid, { url }, singleton ? processIcon : icon);
      }
    },
    [minimize, open, processes, setForegroundId, url]
  );
};

export default useFile;
