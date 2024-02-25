import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import {
  type FileReaders,
  type ObjectReaders,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import { type Size } from "components/system/Window/RndWindow/useResizable";

type BrowserProcessArguments = {
  initialTitle?: string;
};

type DialogProcessArguments = {
  fileReaders?: FileReaders | ObjectReaders;
  progress?: number;
  shortcutPath?: string;
};

type MediaPlayerProcessArguments = {
  pause?: () => void;
  paused?: (callback?: (paused: boolean) => void) => boolean;
  play?: () => void;
};

type MonacoProcessArguments = {
  editor?: Monaco.editor.IStandaloneCodeEditor;
};

type PdfProcessArguments = {
  count?: number;
  page?: number;
  rendering?: boolean;
  scale?: number;
  subTitle?: string;
};

export type RelativePosition = {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
};

type BaseProcessArguments = {
  allowResizing?: boolean;
  autoSizing?: boolean;
  backgroundColor?: string;
  dependantLibs?: string[];
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hideTaskbarEntry?: boolean;
  hideTitlebar?: boolean;
  hideTitlebarIcon?: boolean;
  initialRelativePosition?: RelativePosition;
  libs?: string[];
  lockAspectRatio?: boolean;
  url?: string;
};

export type ProcessArguments = BaseProcessArguments &
  BrowserProcessArguments &
  DialogProcessArguments &
  MediaPlayerProcessArguments &
  MonacoProcessArguments &
  PdfProcessArguments;

export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type Process = ProcessArguments &
  ProcessElements & {
    Component: React.ComponentType<ComponentProcessProps>;
    closing?: boolean;
    defaultSize?: Size;
    hasWindow?: boolean;
    icon: string;
    maximized?: boolean;
    minimized?: boolean;
    preferProcessIcon?: boolean;
    singleton?: boolean;
    title: string;
  };

export type Processes = Record<string, Process>;
