import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { useProcessesRef } from "hooks/useProcessesRef";
import { basename, join } from "path";
import { useCallback } from "react";
import {
  DESKTOP_PATH,
  FOLDER_BACK_ICON,
  PROCESS_DELIMITER,
} from "utils/constants";

type UseFile = (pid: string, icon?: string) => Promise<void>;

const useFile = (url: string): UseFile => {
  const { setForegroundId } = useSession();
  const { createPath, updateFolder } = useFileSystem();
  const { minimize, open, url: setUrl } = useProcesses();
  const processesRef = useProcessesRef();

  return useCallback(
    async (pid: string, icon?: string) => {
      const {
        preferProcessIcon,
        singleton,
        icon: processIcon,
      } = processDirectory[pid] || {};
      const activePid = singleton
        ? Object.keys(processesRef.current).find(
            (id) => id === pid || id.startsWith(`${pid}${PROCESS_DELIMITER}`)
          )
        : "";
      let runUrl = url;

      if (url.startsWith("ipfs://")) {
        const { getIpfsFileName, getIpfsResource } = await import("utils/ipfs");
        const ipfsData = await getIpfsResource(url);

        runUrl = join(
          DESKTOP_PATH,
          await createPath(
            await getIpfsFileName(url, ipfsData),
            DESKTOP_PATH,
            ipfsData
          )
        );

        updateFolder(DESKTOP_PATH, basename(runUrl));
      }

      if (activePid) {
        setUrl(activePid, runUrl);
        if (processesRef.current[activePid].minimized) minimize(activePid);
        setForegroundId(activePid);
      } else {
        open(
          pid || "OpenWith",
          { url: runUrl },
          singleton || icon === FOLDER_BACK_ICON || preferProcessIcon
            ? processIcon
            : icon
        );
      }
    },
    [
      createPath,
      minimize,
      open,
      processesRef,
      setForegroundId,
      setUrl,
      updateFolder,
      url,
    ]
  );
};

export default useFile;
