import { useProcesses } from 'contexts/process';
import { createPid } from 'contexts/process/functions';
import { useSession } from 'contexts/session';

type UseFile = () => void;

const useFile = (url: string, pid: string): UseFile => {
  const { setForegroundId } = useSession();
  const { minimize, open, processes } = useProcesses();
  const openFile = () => {
    const id = createPid(pid, url);

    if (processes[id]) {
      if (processes[id].minimized) minimize(id);
      setForegroundId(id);
    } else {
      open(pid, url);
    }
  };

  return openFile;
};

export default useFile;
