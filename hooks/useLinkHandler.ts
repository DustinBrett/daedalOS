import { relative } from "path";
import { useCallback } from "react";
import { isCorsUrl } from "components/apps/TinyMCE/functions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useProcesses } from "contexts/process";
import { haltEvent, isYouTubeUrl, getExtension } from "utils/functions";
import { useSession } from "contexts/session";

type LinkHandler = (
  event: Event,
  url: string,
  pathName: string,
  title?: string
) => void;

export const useLinkHandler = (): LinkHandler => {
  const { open } = useProcesses();
  const { updateRecentFiles } = useSession();

  return useCallback(
    (event: Event, url: string, pathName: string, title?: string) => {
      haltEvent(event);

      if (isYouTubeUrl(url)) open("VideoPlayer", { url });
      else if (isCorsUrl(url)) open("Browser", { initialTitle: title, url });
      else if (
        !pathName ||
        relative(
          decodeURI(
            (url.startsWith("/") ? url : `/${url}`).replace(
              window.location.origin,
              ""
            )
          ),
          decodeURI(pathName)
        ) === ""
      ) {
        const defaultProcess = getProcessByFileExtension(
          getExtension(pathName)
        );

        if (defaultProcess) {
          const pathUrl = decodeURI(pathName);

          open(defaultProcess, { url: pathUrl });

          if (pathUrl) updateRecentFiles(pathUrl, defaultProcess);
        }
      } else {
        window.open(url, "_blank", "noopener, noreferrer");
      }
    },
    [open, updateRecentFiles]
  );
};
