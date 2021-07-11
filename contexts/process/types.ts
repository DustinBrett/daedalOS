import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import type { Size } from "components/system/Window/RndWindow/useResizable";

export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type Process = ProcessElements & {
  autoSizing?: boolean;
  backgroundColor?: string;
  closing?: boolean;
  Component: React.ComponentType<ComponentProcessProps>;
  defaultSize?: Size;
  hasWindow?: boolean;
  icon: string;
  lockAspectRatio?: boolean;
  maximized?: boolean;
  minimized?: boolean;
  singleton?: boolean;
  title: string;
  url?: string;
};

export type Processes = {
  [id: string]: Process;
};
