import {
  customExtensionLanguages,
  URL_DELIMITER,
} from "components/apps/MonacoEditor/config";
import { monacoExtensions } from "components/apps/MonacoEditor/extensions";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
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

export const relocateShadowRoot: React.FocusEventHandler = ({
  relatedTarget,
}): void => {
  if (
    relatedTarget instanceof HTMLElement &&
    relatedTarget.classList.value === "shadow-root-host" &&
    relatedTarget.shadowRoot instanceof ShadowRoot &&
    relatedTarget.closest("section")
  ) {
    relatedTarget.closest("section")?.parentNode?.prepend(relatedTarget);
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
