import { config, libs } from "components/apps/TinyMCE/config";
import { setReadOnlyMode } from "components/apps/TinyMCE/functions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname, relative } from "path";
import { useCallback, useEffect, useState } from "react";
import type { Editor, NotificationSpec } from "tinymce";
import { loadFiles } from "utils/functions";

const useTinyMCE = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { open } = useProcesses();
  const [editor, setEditor] = useState<Editor>();
  const { appendFileToTitle } = useTitle(id);
  const { readFile, writeFile } = useFileSystem();
  const { onDragOver, onDrop } = useFileDrop({ id });
  const onSave = useCallback(
    async (activeEditor: Editor) => {
      const saveSpec: NotificationSpec = {
        closeButton: true,
        text: "Successfully saved.",
        timeout: 5000,
        type: "success",
      };

      try {
        await writeFile(url, activeEditor.getContent(), true);
      } catch {
        saveSpec.text = "Error occurred while saving.";
        saveSpec.type = "error";
      }

      activeEditor.notificationManager.open(saveSpec);
    },
    [url, writeFile]
  );
  const linksToProcesses = useCallback(() => {
    const iframe = containerRef.current?.querySelector("iframe");

    if (iframe?.contentWindow) {
      [...iframe.contentWindow.document.links].forEach((link) =>
        link.addEventListener("click", (event) => {
          const isRelative =
            relative(link.dataset["mceHref"] || "", link.pathname) === "";

          if (isRelative) {
            event.stopPropagation();
            event.preventDefault();

            const defaultProcess = getProcessByFileExtension(
              extname(link.pathname)
            );

            if (defaultProcess) open(defaultProcess, link.pathname);
          }
        })
      );
    }
  }, [containerRef, open]);
  const loadFile = useCallback(async () => {
    if (editor) {
      const fileContents = await readFile(url);

      if (fileContents.length > 0) setReadOnlyMode(editor);

      editor.setContent(fileContents.toString());
      editor.settings["save_onsavecallback"] = onSave;

      linksToProcesses();

      appendFileToTitle(basename(url, extname(url)));
    }
  }, [appendFileToTitle, editor, linksToProcesses, onSave, readFile, url]);

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
                iframe.contentWindow.addEventListener("dragover", onDragOver);
                iframe.contentWindow.addEventListener("drop", onDrop);
              }

              setEditor(activeEditor);
              setLoading(false);
            });
        }
      });
    }
  }, [containerRef, editor, onDragOver, onDrop, onSave, setLoading]);

  useEffect(() => {
    if (url && editor && readFile) loadFile();
  }, [editor, loadFile, readFile, url]);

  useEffect(() => () => editor?.destroy(), [editor]);
};

export default useTinyMCE;
