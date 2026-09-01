import { relative } from "path";
import { useCallback } from "react";
import { isCorsUrl } from "components/apps/TinyMCE/functions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useProcessesActions } from "contexts/process";
import { haltEvent, isYouTubeUrl, getExtension } from "utils/functions";
import { useSessionActions } from "contexts/session";

type LinkHandler = (
  event: Event,
  rawUrl: string,
  pathName: string,
  title?: string
) => void;

export const useLinkHandler = (): LinkHandler => {
  const { open } = useProcessesActions();
  const { updateRecentFiles } = useSessionActions();

  return useCallback<LinkHandler>(
    (event, rawUrl, pathName, title) => {
      haltEvent(event);

      const url = rawUrl.replace(/^http:/i, "https:");

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
        window.open(rawUrl, "_blank", "noopener, noreferrer");
      }
    },
    [open, updateRecentFiles]
  );
};
