import { type Editor } from "tinymce";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

export const draggableEditor = (activeEditor: Editor): boolean =>
  activeEditor?.mode.isReadOnly() || !activeEditor?.getContent();

export const setReadOnlyMode = (editor: Editor, callback: () => void): void => {
  const toolbars = editor.editorContainer?.querySelector(".tox-editor-header");

  if (toolbars instanceof HTMLDivElement) {
    toolbars.addEventListener(
      "click",
      () => {
        toolbars.removeAttribute("title");
        editor.mode.set("design");
        callback();
      },
      ONE_TIME_PASSIVE_EVENT
    );
  }

  editor.mode.set("readonly");
};

const allowedCorsDomains = new Set(["wikipedia.org", "archive.org"]);

export const isCorsUrl = (url?: string): boolean => {
  if (!url) return false;

  try {
    const { hostname } = new URL(url);
    const [, domain, tld] = hostname.split(".");

    return (
      allowedCorsDomains.has(`${domain}.${tld}`) ||
      allowedCorsDomains.has(hostname)
    );
  } catch {
    return false;
  }
};
