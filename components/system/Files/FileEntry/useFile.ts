import { basename, extname, join } from "path";
import { useFileSystemActions } from "contexts/fileSystem";
import {
  getProcess,
  getProcesses,
  useProcessesActions,
} from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSessionActions } from "contexts/session";
import {
  DESKTOP_PATH,
  FOLDER_BACK_ICON,
  PROCESS_DELIMITER,
} from "utils/constants";
import { copyBufferUrl, isYouTubeUrl } from "utils/functions";
import type * as Ipfs from "utils/ipfs";

type UseFile = (pid: string, icon?: string) => Promise<void>;

const loadIpfs = (): Promise<typeof Ipfs> => import("utils/ipfs");

const useFile = (url: string, path: string): UseFile => {
  const { setForegroundId, updateRecentFiles } = useSessionActions();
  const { createPath, updateFolder } = useFileSystemActions();
  const { minimize, open, url: setUrl } = useProcessesActions();

  return async (pid: string, icon?: string) => {
    const {
      icon: processIcon,
      preferProcessIcon,
      singleton,
    } = processDirectory[pid] || {};
    const activePid = singleton
      ? Object.keys(getProcesses()).find(
          (id) => id === pid || id.startsWith(`${pid}${PROCESS_DELIMITER}`)
        )
      : "";
    let runUrl = url;

    if (url.startsWith("ipfs://")) {
      const { getIpfsFileName, getIpfsResource } = await loadIpfs();
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
      if (getProcess(activePid)?.minimized) minimize(activePid);
      setForegroundId(activePid);
    } else {
      const windowIcon =
        singleton || icon === FOLDER_BACK_ICON || preferProcessIcon
          ? processIcon
          : icon;

      // A window's icons revoke blob URLs on close, so it gets its own copy
      open(
        pid || "OpenWith",
        { url: runUrl },
        windowIcon?.startsWith("blob:")
          ? await copyBufferUrl(windowIcon).catch(() => processIcon)
          : windowIcon
      );

      const recentUrl = runUrl || path;

      if (recentUrl && pid) {
        updateRecentFiles(
          recentUrl,
          pid,
          isYouTubeUrl(recentUrl) ? basename(path, extname(path)) : undefined
        );
      }
    }
  };
};

export default useFile;
