import { DEFAULT_SAVE_PATH, config } from "components/apps/TinyMCE/config";
import {
  draggableEditor,
  setReadOnlyMode,
} from "components/apps/TinyMCE/functions";
import type { IRTFJS } from "components/apps/TinyMCE/types";
import type { ContainerHookProps } from "components/system/Apps/AppContainer";
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
import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor, NotificationSpec } from "tinymce";
import { DEFAULT_LOCALE } from "utils/constants";
import { getExtension, haltEvent, loadFiles } from "utils/functions";

type OptionSetter = <K, T>(name: K, value: T) => void;

const useTinyMCE = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const {
    open,
    processes: { [id]: { libs = [] } = {} } = {},
    url: setUrl,
  } = useProcesses();
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
      const date = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
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
          const mceHref = link.dataset.mceHref || "";
          const isRelative =
            relative(
              mceHref.startsWith("/") ? mceHref : `/${mceHref}`,
              link.pathname
            ) === "";
          if (isRelative && editor?.mode.isReadOnly()) {
            haltEvent(event);

            const defaultProcess = getProcessByFileExtension(
              getExtension(link.pathname)
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

      if (getExtension(url) === ".rtf") {
        const { RTFJS } = (await import("rtf.js")) as unknown as IRTFJS;
        const rtfDoc = new RTFJS.Document(fileContents);
        const rtfHtml = await rtfDoc.render();

        editor.setContent(
          rtfHtml.map((domElement) => domElement.outerHTML).join("")
        );
      } else {
        editor.setContent(fileContents.toString());
      }

      linksToProcesses();
      updateTitle(url);

      if (editor.iframeElement?.contentDocument) {
        editor.iframeElement.contentDocument.documentElement.scrollTop = 0;
      }
    }
  }, [editor, linksToProcesses, readFile, updateTitle, url]);
  const initEditor = useRef(false);

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
          await writeFile(
            getExtension(saveUrl) === ".rtf"
              ? saveUrl.replace(".rtf", ".whtml")
              : saveUrl,
            editor.getContent(),
            true
          );
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
    if (!editor && !initEditor.current) {
      initEditor.current = true;

      loadFiles(libs).then(() => {
        if (window.tinymce && containerRef.current) {
          window.tinymce.remove();
          window.tinymce
            .init({
              readonly: Boolean(url),
              selector: `.${[...containerRef.current.classList].join(".")} div`,
              setup: (editorInstance) => {
                editorInstance.on("ExecCommand", ({ command }) => {
                  if (command === "mceNewDocument") {
                    setUrl(id, "");
                    prependFileToTitle("");
                  }
                });
              },
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
                iframe.contentWindow.addEventListener("blur", () =>
                  setForegroundId((currentForegroundId) =>
                    currentForegroundId === id ? "" : currentForegroundId
                  )
                );
                iframe.contentWindow.addEventListener("focus", () =>
                  setForegroundId(id)
                );
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
    libs,
    onDragOver,
    onDrop,
    prependFileToTitle,
    setForegroundId,
    setLoading,
    setUrl,
    url,
  ]);

  useEffect(() => {
    if (url && editor) loadFile();
  }, [editor, loadFile, url]);

  useEffect(
    () => () => {
      window.setTimeout(() => editor?.destroy(), 0);
    },
    [editor]
  );
};

export default useTinyMCE;
