import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { useCallback } from "react";
import { FOLDER_BACK_ICON, PROCESS_DELIMITER } from "utils/constants";

type UseFile = (pid: string, icon?: string) => void;

const useFile = (url: string): UseFile => {
  const { setForegroundId } = useSession();
  const { minimize, open, processes, url: setUrl } = useProcesses();

  return useCallback(
    (pid: string, icon?: string) => {
      const { singleton, icon: processIcon } = processDirectory[pid] || {};
      const activePid = Object.keys(processes).find((id) =>
        id.startsWith(`${pid}${PROCESS_DELIMITER}`)
      );

      if (singleton && activePid) {
        setUrl(activePid, url);
        if (processes[activePid].minimized) minimize(activePid);
        setForegroundId(activePid);
      } else {
        open(
          pid,
          { url },
          singleton || icon === FOLDER_BACK_ICON ? processIcon : icon
        );
      }
    },
    [minimize, open, processes, setForegroundId, setUrl, url]
  );
};

export default useFile;
