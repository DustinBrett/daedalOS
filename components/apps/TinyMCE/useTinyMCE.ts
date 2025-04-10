import { basename, dirname, extname } from "path";
import { type Editor, type NotificationSpec } from "tinymce";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SAVE_PATH, config } from "components/apps/TinyMCE/config";
import {
  draggableEditor,
  setReadOnlyMode,
} from "components/apps/TinyMCE/functions";
import { type IRTFJS } from "components/apps/TinyMCE/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { DEFAULT_LOCALE, DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";
import { getExtension, loadFiles } from "utils/functions";
import { useLinkHandler } from "hooks/useLinkHandler";

const useTinyMCE = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { processes: { [id]: { libs = [] } = {} } = {}, url: setUrl } =
    useProcesses();
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
  const openLink = useLinkHandler();
  const linksToProcesses = useCallback(() => {
    const iframe = containerRef.current?.querySelector("iframe");

    if (iframe?.contentWindow) {
      [...iframe.contentWindow.document.links].forEach((link) =>
        link.addEventListener("click", (event) => {
          if (editor?.mode.isReadOnly()) {
            openLink(
              event,
              link.dataset.mceHref || "",
              link.pathname,
              link.textContent || ""
            );
          }
        })
      );
    }
  }, [containerRef, editor?.mode, openLink]);
  const loadFile = useCallback(async () => {
    if (editor) {
      const setupSaveCallback = (): void => {
        editor.options.set("save_onsavecallback", async () => {
          const saveSpec: NotificationSpec & {
            closeButton: boolean; // V6 Spec
          } = {
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

          const notification = editor.notificationManager
            .getNotifications()?.[0]
            ?.getEl()?.parentElement;
          const mceContainer = editor.editorContainer;

          if (
            notification instanceof HTMLElement &&
            mceContainer instanceof HTMLElement
          ) {
            mceContainer.append(notification);
            notification.setAttribute(
              "style",
              "position: absolute; right: 0; bottom: 0; padding: 33px 25px;"
            );
            notification
              .querySelector("[role=alert]")
              ?.setAttribute("style", "opacity: 1;");
          }

          if (saveUrl === DEFAULT_SAVE_PATH) updateTitle(saveUrl);
        });
      };
      const fileContents = url ? await readFile(url) : Buffer.from("");

      if (fileContents.length === 0) {
        editor.mode.set("design");
        setupSaveCallback();
      } else {
        setReadOnlyMode(editor, setupSaveCallback);

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

        if (editor.iframeElement?.contentDocument) {
          editor.iframeElement.contentDocument.documentElement.scrollTop = 0;
        }
      }

      if (url) updateTitle(url);
    }
  }, [
    editor,
    linksToProcesses,
    readFile,
    updateFolder,
    updateTitle,
    url,
    writeFile,
  ]);
  const initEditor = useRef(false);

  useEffect(() => {
    if (!editor && !initEditor.current) {
      initEditor.current = true;

      loadFiles(libs).then(() => {
        if (window.tinymce && containerRef.current) {
          window.tinymce
            .init({
              readonly: Boolean(url),
              selector: `.${[...containerRef.current.classList].join(".")} div[id="${id}"]`,
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
                iframe.contentWindow.addEventListener(
                  "mousedown",
                  ({ pageX }) =>
                    iframe.contentWindow &&
                    pageX >
                      iframe.contentWindow.innerWidth -
                        DEFAULT_SCROLLBAR_WIDTH &&
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
    if (editor) loadFile();
  }, [editor, loadFile]);

  useEffect(
    () => () => {
      window.setTimeout(() => editor?.destroy(), 0);
    },
    [editor]
  );
};

export default useTinyMCE;
