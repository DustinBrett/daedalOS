import { useProcesses } from "contexts/process";
import { createPid } from "contexts/process/functions";
import { useSession } from "contexts/session";

type UseFile = (pid: string, icon?: string) => void;

const useFile = (url: string): UseFile => {
  const { setForegroundId } = useSession();
  const { minimize, open, processes } = useProcesses();

  return (pid: string, icon?: string) => {
    const id = createPid(pid, url);

    if (processes[id]) {
      if (processes[id].minimized) minimize(id);
      setForegroundId(id);
    } else {
      open(pid, url, icon);
    }
  };
};

export default useFile;
