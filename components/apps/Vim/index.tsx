import { basename, dirname, extname } from "path";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import StyledVim from "components/apps/Vim/StyledVim";
import { type QueueItem } from "components/apps/Vim/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useEmscriptenMount from "components/system/Files/FileManager/useEmscriptenMount";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { DEFAULT_TEXT_FILE_SAVE_PATH } from "utils/constants";
import { haltEvent, loadFiles } from "utils/functions";

const Vim: FC<ComponentProcessProps> = ({ id }) => {
  const {
    closeWithTransition,
    processes: { [id]: process },
  } = useProcesses();
  const { readFile, updateFolder, writeFile } = useFileSystem();
  const mountEmFs = useEmscriptenMount();
  const { prependFileToTitle } = useTitle(id);
  const { libs = [], url = "" } = process || {};
  const [updateQueue, setUpdateQueue] = useState<QueueItem[]>([]);
  const loading = useRef(false);
  const loadVim = useCallback(async () => {
    const saveUrl = url || DEFAULT_TEXT_FILE_SAVE_PATH;
    const [, ...pathParts] = saveUrl.split("/");
    let prependPath = "";

    if (pathParts.length === 1) {
      prependPath = "/root";
    }

    window.VimWrapperModule = {};

    await loadFiles(libs, false, !!window.VimWrapperModule);

    const fileData = url ? await readFile(saveUrl) : Buffer.from("");

    window.VimWrapperModule?.init?.({
      VIMJS_ALLOW_EXIT: true,
      arguments: [`${prependPath}${saveUrl}`],
      containerWindow: document
        .querySelector("#vimjs-container")
        ?.closest("section"),
      memoryInitializerPrefixURL: "/Program Files/Vim.js/",
      postRun: [
        () => {
          loading.current = false;
          mountEmFs(
            window.VimWrapperModule?.VimModule?.FS,
            url ? `Vim_${basename(url, extname(url))}` : id
          );
        },
      ],
      preRun: [
        () => {
          let walkedPath = "";

          [prependPath, ...pathParts].forEach(
            (pathPart, index, { [index + 1]: nextPart }) => {
              if (nextPart && index + 1 !== pathParts.length) {
                window.VimWrapperModule?.VimModule?.FS_createPath?.(
                  walkedPath,
                  nextPart,
                  true,
                  true
                );
                walkedPath += `/${nextPart}`;
              } else if (walkedPath) {
                window.VimWrapperModule?.VimModule?.FS_createDataFile?.(
                  walkedPath,
                  pathPart,
                  fileData,
                  true,
                  true
                );
              } else {
                walkedPath = pathPart;
              }
            }
          );
        },
      ],
      print: console.info,
      printErr: console.info,
      quitCallback: () => closeWithTransition(id),
      writeCallback: (data) =>
        setUpdateQueue((currentQueue) => [
          ...currentQueue,
          {
            buffer: Buffer.from(data),
            url: saveUrl,
          },
        ]),
    });

    prependFileToTitle(basename(saveUrl));
  }, [
    closeWithTransition,
    id,
    libs,
    mountEmFs,
    prependFileToTitle,
    readFile,
    url,
  ]);

  useEffect(() => {
    if (updateQueue.length > 0) {
      [...updateQueue].forEach(({ buffer, url: saveUrl }) => {
        writeFile(saveUrl, buffer, true);
        updateFolder(dirname(saveUrl), basename(saveUrl));
      });
      setUpdateQueue([]);
    }
  }, [updateFolder, updateQueue, writeFile]);

  useEffect(() => {
    if (!loading.current) {
      loading.current = true;
      loadVim();
    }

    return () => {
      if (
        !loading &&
        window.VimWrapperModule?.VimModule?.asmLibraryArg?._vimjs_prepare_exit()
      ) {
        window.VimWrapperModule?.VimModule?.exit?.();
      }
    };
  }, [loadVim]);

  return (
    <StyledVim>
      <div id="vimjs-container" {...useFileDrop({ id })}>
        <canvas id="vimjs-canvas" onContextMenuCapture={haltEvent} />
      </div>
      <div id="vimjs-font-test" />
    </StyledVim>
  );
};

export default memo(Vim);
