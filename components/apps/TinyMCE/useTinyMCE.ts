import {
  config,
  DEFAULT_SAVE_PATH,
  libs,
} from "components/apps/TinyMCE/config";
import {
  draggableEditor,
  setReadOnlyMode,
} from "components/apps/TinyMCE/functions";
import {
  getModifiedTime,
  getProcessByFileExtension,
} from "components/system/Files/FileEntry/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, dirname, extname, relative } from "path";
import { useCallback, useEffect, useState } from "react";
import type { Editor, NotificationSpec } from "tinymce";
import { haltEvent, loadFiles } from "utils/functions";

type OptionSetter = <K, T>(name: K, value: T) => void;

const useTinyMCE = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { open } = useProcesses();
  const [editor, setEditor] = useState<Editor>();
  const { prependFileToTitle } = useTitle(id);
  const { readFile, stat, updateFolder, writeFile } = useFileSystem();
  const { onDragOver, onDrop } = useFileDrop({ id });
  const { setForegroundId } = useSession();
  const updateTitle = useCallback(
    async (currentUrl: string) => {
      const modifiedDate = new Date(
        getModifiedTime(currentUrl, await stat(currentUrl))
      );
      const date = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(modifiedDate);

      prependFileToTitle(
        `${basename(currentUrl, extname(currentUrl))} (${date})`
      );
    },
    [prependFileToTitle, stat]
  );
  const linksToProcesses = useCallback(() => {
    const iframe = containerRef.current?.querySelector("iframe");

    if (iframe?.contentWindow) {
      [...iframe.contentWindow.document.links].forEach((link) =>
        link.addEventListener("click", (event) => {
          const mceHref = link.dataset["mceHref"] || "";
          const isRelative =
            relative(
              mceHref.startsWith("/") ? mceHref : `/${mceHref}`,
              link.pathname
            ) === "";
          if (isRelative && editor?.mode.isReadOnly()) {
            haltEvent(event);

            const defaultProcess = getProcessByFileExtension(
              extname(link.pathname).toLowerCase()
            );

            if (defaultProcess) open(defaultProcess, { url: link.pathname });
          }
        })
      );
    }
  }, [containerRef, editor?.mode, open]);
  const loadFile = useCallback(async () => {
    if (editor) {
      const fileContents = await readFile(url);

      if (fileContents.length > 0) setReadOnlyMode(editor);

      editor.setContent(fileContents.toString());

      linksToProcesses();
      updateTitle(url);
    }
  }, [editor, linksToProcesses, readFile, updateTitle, url]);

  useEffect(() => {
    if (editor) {
      (editor.options.set as OptionSetter)("save_onsavecallback", async () => {
        const saveSpec: NotificationSpec = {
          closeButton: true,
          text: "Successfully saved.",
          timeout: 5000,
          type: "success",
        };
        const saveUrl = url || DEFAULT_SAVE_PATH;

        try {
          await writeFile(saveUrl, editor.getContent(), true);
          updateFolder(dirname(saveUrl), basename(saveUrl));
          updateTitle(saveUrl);
        } catch {
          saveSpec.text = "Error occurred while saving.";
          saveSpec.type = "error";
        }

        editor.notificationManager.open(saveSpec);
      });
    }
  }, [editor, updateFolder, updateTitle, url, writeFile]);

  useEffect(() => {
    if (!editor) {
      loadFiles(libs).then(() => {
        if (window.tinymce && containerRef.current) {
          window.tinymce.remove();
          window.tinymce
            .init({
              selector: `.${[...containerRef.current.classList].join(".")} div`,
              ...config,
            })
            .then(([activeEditor]) => {
              const iframe = containerRef.current?.querySelector("iframe");

              if (iframe?.contentWindow) {
                iframe.contentWindow.addEventListener("dragover", (event) => {
                  if (draggableEditor(activeEditor)) onDragOver(event);
                });
                iframe.contentWindow.addEventListener("drop", (event) => {
                  if (draggableEditor(activeEditor)) onDrop(event);
                });
                iframe.contentWindow.addEventListener("focus", () => {
                  setForegroundId(id);
                  containerRef.current?.closest("section")?.focus();
                });
              }

              setEditor(activeEditor);
              setLoading(false);
            });
        }
      });
    }
  }, [
    containerRef,
    editor,
    id,
    onDragOver,
    onDrop,
    setForegroundId,
    setLoading,
  ]);

  useEffect(() => {
    if (url && editor) loadFile();
  }, [editor, loadFile, readFile, url]);

  useEffect(
    () => () => {
      window.setTimeout(() => editor?.destroy(), 0);
    },
    [editor]
  );
};

export default useTinyMCE;
