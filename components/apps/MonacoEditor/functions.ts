import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  customExtensionLanguages,
  URL_DELIMITER,
} from "components/apps/MonacoEditor/config";
import { monacoExtensions } from "components/apps/MonacoEditor/extensions";
import { DEFAULT_TEXT_FILE_SAVE_PATH } from "utils/constants";

export const detectLanguage = (ext: string): string => {
  const extension = customExtensionLanguages[ext] || ext;

  if (!monacoExtensions.has(extension)) return "";

  const { id = "" } =
    window.monaco.languages
      .getLanguages()
      .find((language) => language.extensions?.includes(extension)) || {};

  return id;
};

export const relocateShadowRoot = ({ relatedTarget }: FocusEvent): void => {
  if (relatedTarget instanceof HTMLElement) {
    let targetElement: HTMLElement | undefined;

    if (relatedTarget.classList.value === "actions-container") {
      targetElement = relatedTarget.closest(
        ".monaco-menu-container"
      ) as HTMLElement;
    } else if (
      relatedTarget.classList.value === "shadow-root-host" &&
      relatedTarget.shadowRoot instanceof ShadowRoot
    ) {
      targetElement = relatedTarget;
    }

    if (
      targetElement instanceof HTMLElement &&
      targetElement.closest("section")
    ) {
      targetElement.closest("section")?.parentNode?.prepend(targetElement);
    }
  }
};

export const getSaveFileInfo = (
  url?: string,
  editor?: Monaco.editor.IStandaloneCodeEditor
): [] | [string, string] => {
  if (!editor) return [];

  const { uri } = editor.getModel() || {};
  const [baseUrl] = uri?.path.split(URL_DELIMITER) || [];
  const saveUrl =
    uri?.scheme === "file" ? baseUrl : url || DEFAULT_TEXT_FILE_SAVE_PATH;

  return !url || url === baseUrl ? [saveUrl, editor.getValue()] : [];
};
