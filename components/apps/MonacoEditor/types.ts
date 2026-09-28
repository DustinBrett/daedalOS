import type * as Monaco from "monaco-editor";

export type Model = Monaco.editor.ITextModel & {
  _associatedResource: {
    path: string;
  };
  getLanguageIdentifier: () => { language: string };
};

declare global {
  interface Window {
    monaco: typeof Monaco;
  }
}
