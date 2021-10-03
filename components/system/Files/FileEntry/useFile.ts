import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { createPid } from "contexts/process/functions";
import { useSession } from "contexts/session";

type UseFile = (pid: string, icon?: string) => void;

const useFile = (url: string): UseFile => {
  const { setForegroundId } = useSession();
  const { minimize, open, processes } = useProcesses();

  return (pid: string, icon?: string) => {
    const id = createPid(pid, url);
    const { [id]: process } = processes;

    if (process) {
      if (process.minimized) minimize(id);
      setForegroundId(id);
    } else {
      const { singleton, icon: processIcon } = processDirectory[pid] || {};

      open(pid, url, singleton ? processIcon : icon);
    }
  };
};

export default useFile;
