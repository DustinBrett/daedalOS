import { type Editor } from "tinymce";
import { ONE_TIME_PASSIVE_EVENT, PREVENT_SCROLL } from "utils/constants";

export const draggableEditor = (activeEditor: Editor): boolean =>
  activeEditor?.mode.isReadOnly() || !activeEditor?.getContent();

// The hidden header shows "Edit Document", so it acts as its button, though
// the read-only editor marks everything inside it as disabled
const EDIT_BUTTON_ATTRIBUTES: Record<string, string> = {
  "aria-disabled": "false",
  "aria-label": "Edit Document",
  role: "button",
  tabindex: "0",
};

export const setReadOnlyMode = (editor: Editor, callback: () => void): void => {
  const toolbars = editor.editorContainer?.querySelector(".tox-editor-header");

  if (toolbars instanceof HTMLDivElement) {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toolbars.click();
        editor.focus();
      }
    };

    Object.entries(EDIT_BUTTON_ATTRIBUTES).forEach(([name, value]) =>
      toolbars.setAttribute(name, value)
    );
    toolbars.addEventListener("keydown", onKeyDown);
    toolbars.addEventListener(
      "click",
      () => {
        // Focus stays in the window as the header stops being focusable
        if (document.activeElement === toolbars) {
          toolbars.closest("section")?.focus(PREVENT_SCROLL);
        }
        Object.keys(EDIT_BUTTON_ATTRIBUTES).forEach((name) =>
          toolbars.removeAttribute(name)
        );
        toolbars.removeEventListener("keydown", onKeyDown);
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
