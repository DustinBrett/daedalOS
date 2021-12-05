import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import type { FileReaders } from "utils/useDialog";

type DialogProcessArguments = {
  fileReaders?: FileReaders;
};

type MonacoProcessArguments = {
  editor?: Monaco.editor.IStandaloneCodeEditor;
};

export type ProcessArguments = DialogProcessArguments &
  MonacoProcessArguments & {
    url?: string;
  };

export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type Process = ProcessArguments &
  ProcessElements & {
    allowResizing?: boolean;
    autoSizing?: boolean;
    background?: string;
    closing?: boolean;
    Component: React.ComponentType<ComponentProcessProps>;
    defaultSize?: Size;
    hasWindow?: boolean;
    hideTitlebarIcon?: boolean;
    icon: string;
    lockAspectRatio?: boolean;
    maximized?: boolean;
    minimized?: boolean;
    prependTaskbarTitle?: boolean;
    singleton?: boolean;
    title: string;
  };

export type Processes = Record<string, Process>;
