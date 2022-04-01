import type { Editor } from "tinymce";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";

export const draggableEditor = (activeEditor: Editor): boolean =>
  activeEditor?.mode.isReadOnly() || !activeEditor?.getContent();

export const setReadOnlyMode = (editor: Editor): void => {
  const toolbars = editor.editorContainer?.querySelector(".tox-editor-header");

  if (toolbars instanceof HTMLDivElement) {
    toolbars.addEventListener(
      "click",
      () => {
        toolbars.removeAttribute("title");
        editor.mode.set("design");
      },
      ONE_TIME_PASSIVE_EVENT
    );
  }

  editor.mode.set("readonly");
};
