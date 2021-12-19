import {
  customExtensionLanguages,
  monacoExtensions,
} from "components/apps/MonacoEditor/config";

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
