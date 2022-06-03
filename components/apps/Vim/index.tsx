import StyledVim from "components/apps/Vim/StyledVim";
import type { VimModule } from "components/apps/Vim/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useCallback, useEffect } from "react";
import { DEFAULT_TEXT_FILE_SAVE_PATH } from "utils/constants";
import { loadFiles } from "utils/functions";

const Vim: FC<ComponentProcessProps> = ({ id }) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { readFile } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const { closing = false, url = "" } = process || {};
  const loadVim = useCallback(async () => {
    const [, ...pathParts] = url.split("/");
    const hasVimLoaded = Boolean(window.vimjs);
    let loadUrl = url || DEFAULT_TEXT_FILE_SAVE_PATH;

    if (pathParts.length === 1) {
      loadUrl = `/${url}`;
    }

    window.vimjs = undefined;
    window.VimModule = {
      VIMJS_ALLOW_EXIT: true,
      arguments: [loadUrl],
      loadedFS: hasVimLoaded,
      memoryInitializerPrefixURL: "/Program Files/Vim/",
      preRun: [
        () => {
          const vimModule = window.VimModule as VimModule;
          let walkedPath = "";

          ["/", ...pathParts].forEach(
            (pathPart, index, { [index + 1]: nextPart }) => {
              if (nextPart && index + 1 !== pathParts.length) {
                vimModule.FS_createPath?.(walkedPath, nextPart, true, true);
                walkedPath += `/${nextPart}`;
              } else if (!walkedPath) {
                walkedPath = pathPart;
              } else {
                readFile(url).then((data) => {
                  vimModule.FS_createDataFile?.(
                    walkedPath,
                    pathPart,
                    data,
                    true,
                    true
                  );
                });
              }
            }
          );

          if (!hasVimLoaded) window.vimjs?.pre_run();
        },
      ],
    };

    await loadFiles(["/Program Files/Vim/vim.js"], false, hasVimLoaded);

    appendFileToTitle(basename(url));
  }, [appendFileToTitle, readFile, url]);

  useEffect(() => {
    if (!closing) loadVim();

    return () => {
      if (closing && window.VimModule?.asmLibraryArg?._vimjs_prepare_exit()) {
        window.VimModule?.exit?.();
      }
    };
  }, [closing, loadVim]);

  return (
    <StyledVim>
      <div id="vimjs-container">
        <canvas id="vimjs-canvas" />
      </div>
      <div id="vimjs-font-test" />
    </StyledVim>
  );
};

export default Vim;
