import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import {
  type Operation,
  type FileReaders,
  type ObjectReaders,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import { type Size } from "components/system/Window/RndWindow/useResizable";

type BrowserProcessArguments = {
  initialTitle?: string;
};

type DialogProcessArguments = {
  fileReaders?: FileReaders | ObjectReaders;
  operation?: Operation;
  progress?: number;
  shortcutPath?: string;
};

type MediaPlayerProcessArguments = {
  mute?: () => void;
  muted?: boolean;
  pause?: () => void;
  paused?: boolean;
  play?: () => void;
  unmute?: () => void;
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
  backgroundBlur?: string;
  backgroundColor?: string;
  dependantLibs?: string[];
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hidePeek?: boolean;
  hideTaskbarEntry?: boolean;
  hideTitlebar?: boolean;
  hideTitlebarIcon?: boolean;
  initialRelativePosition?: RelativePosition;
  libs?: string[];
  lockAspectRatio?: boolean;
  peekImage?: string;
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
    dialogProcess?: boolean;
    hasWindow?: boolean;
    icon: string;
    maximized?: boolean;
    minimized?: boolean;
    preferProcessIcon?: boolean;
    singleton?: boolean;
    title: string;
  };

export type Processes = Record<string, Process>;
